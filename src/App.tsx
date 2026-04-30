import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Welcome from './components/Welcome';
import DataExplorer from './components/DataExplorer';
import DatasetDetails from './components/DatasetDetails';

// Types
interface HitSource {
  "Study Title": string;
  "Study Description": string;
  "Data Source Type": string;
  "Study Assay Measurement Type": string;
  "organism": string | string[];
  "Accession": string;
  "Project Title"?: string;
  "Study Public Release Date"?: string;
  "Study Funding Agency"?: string;
  "Managing NASA Center"?: string;
  "Data Source Accession"?: string;
  "ftpLink"?: string;
  "suppFile"?: string;
}

interface Hit {
  _id: string;
  _score: number;
  _source: HitSource;
}

const API_KEY = "PiK7jHqZq5L283WLXcLKOxB7JZe3MmjUNcqXvHC8";

function App() {
  const [viewState, setViewState] = useState('welcome'); // 'welcome', 'search', 'details'

  const [searchTerm, setSearchTerm] = useState('');
  const [query, setQuery] = useState('spaceflight'); // Default search
  const [results, setResults] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal states
  const [selectedResult, setSelectedResult] = useState<Hit | null>(null);
  const [detailedMeta, setDetailedMeta] = useState<any>(null);
  const [studyFiles, setStudyFiles] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Filters state
  const [selectedOrganism, setSelectedOrganism] = useState('All');
  const [selectedExpType, setSelectedExpType] = useState('All');
  const [sortBy, setSortBy] = useState('relevance'); // 'relevance', 'date'

  useEffect(() => {
    fetchData();
  }, [query]);

  const fetchData = async () => {
    if (!query) return;
    setLoading(true);
    setError('');
    try {
      const nasaUrl = `https://osdr.nasa.gov/osdr/data/search?term=${encodeURIComponent(query)}&size=30&type=cgene&api_key=${API_KEY}`;
      const nasaResponse = fetch(`https://corsproxy.io/?${encodeURIComponent(nasaUrl)}`);
      
      const ncbiKey = "3125a6e4348714d6b42c892607a329da4b08";
      const ncbiSearchResponse = fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gds&term=${encodeURIComponent(query)}&retmode=json&api_key=${ncbiKey}&retmax=30`);

      const [nasaRes, ncbiSearchRes] = await Promise.all([nasaResponse, ncbiSearchResponse]);
      
      let allHits: Hit[] = [];

      if (nasaRes.ok) {
        const nasaData = await nasaRes.json();
        if (nasaData.hits && nasaData.hits.hits) {
          allHits = [...nasaData.hits.hits];
        }
      }

      if (ncbiSearchRes.ok) {
        const ncbiSearchData = await ncbiSearchRes.json();
        const idList = ncbiSearchData.esearchresult?.idlist || [];
        if (idList.length > 0) {
          const ids = idList.join(',');
          const ncbiSummaryRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gds&id=${ids}&retmode=json&api_key=${ncbiKey}`);
          if (ncbiSummaryRes.ok) {
            const ncbiSummaryData = await ncbiSummaryRes.json();
            const resultObj = ncbiSummaryData.result || {};
            
            const uids = resultObj.uids || [];
            const ncbiHits: Hit[] = uids.map((uid: string) => {
              const item = resultObj[uid];
              return {
                _id: `ncbi-${uid}`,
                _score: 1, // Default score
                _source: {
                  "Study Title": item.title,
                  "Study Description": item.summary,
                  "Data Source Type": "NCBI GEO",
                  "Study Assay Measurement Type": item.gdstype || "N/A",
                  "organism": item.taxon,
                  "Accession": item.accession,
                  "Study Public Release Date": item.pdat ? item.pdat.replace(/\//g, '-') : undefined,
                  "ftpLink": item.ftplink,
                  "suppFile": item.suppfile
                }
              };
            });
            allHits = [...allHits, ...ncbiHits];
          }
        }
      }

      setResults(allHits);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchTerm);
    setViewState('search');
    setSelectedResult(null);
  };

  const handleSelectResult = async (hit: Hit) => {
    setSelectedResult(hit);
    setViewState('details');
    setDetailedMeta(null);
    setStudyFiles([]);
    
    const accession = hit._source.Accession;
    const match = accession.match(/^OSD-(\d+)$/i);
    
    if (match) {
      const osdId = match[1];
      setLoadingDetails(true);
      try {
        const metaUrl = `https://osdr.nasa.gov/osdr/data/osd/meta/${osdId}`;
        const filesUrl = `https://osdr.nasa.gov/osdr/data/osd/files/${osdId}`;
        const [metaRes, filesRes] = await Promise.all([
          fetch(`https://corsproxy.io/?${encodeURIComponent(metaUrl)}`),
          fetch(`https://corsproxy.io/?${encodeURIComponent(filesUrl)}`)
        ]);
        
        if (metaRes.ok) {
          const metaData = await metaRes.json();
          const studyKey = Object.keys(metaData.study || {})[0];
          if (studyKey && metaData.study[studyKey]) {
            const studyData = metaData.study[studyKey].studies?.[0] || {};
            setDetailedMeta(studyData);
          }
        }
        
        if (filesRes.ok) {
          const filesData = await filesRes.json();
          const studyKey = Object.keys(filesData.studies || {})[0];
          if (studyKey && filesData.studies[studyKey]) {
             setStudyFiles(filesData.studies[studyKey].study_files || []);
          }
        }
      } catch (err) {
        console.error("Error fetching detailed metadata/files", err);
      } finally {
        setLoadingDetails(false);
      }
    } else if (hit._source["Data Source Type"] === "NCBI GEO") {
      const accession = hit._source.Accession;
      const ftpLink = (hit._source as any).ftpLink || '';
      
      const files = [];
      
      if (ftpLink) {
        const httpsLink = ftpLink.replace('ftp://', 'https://');
        
        files.push({
          file_name: `${accession}_series_matrix.txt.gz`,
          category: 'Series Matrix',
          file_size: 0,
          remote_url: `${httpsLink}matrix/${accession}_series_matrix.txt.gz`
        });

        files.push({
          file_name: `${accession}_family.soft.gz`,
          category: 'SOFT Format',
          file_size: 0,
          remote_url: `${httpsLink}soft/${accession}_family.soft.gz`
        });
        
        files.push({
          file_name: `${accession}_family.xml.tgz`,
          category: 'MINiML Format',
          file_size: 0,
          remote_url: `${httpsLink}miniml/${accession}_family.xml.tgz`
        });

        if ((hit._source as any).suppFile) {
          files.push({
            file_name: `${accession}_RAW.tar`,
            category: `Supplementary (${(hit._source as any).suppFile})`,
            file_size: 0,
            remote_url: `${httpsLink}suppl/${accession}_RAW.tar`
          });
        }
      }
      
      setDetailedMeta({
        description: hit._source["Study Description"],
        title: hit._source["Study Title"],
      });
      setStudyFiles(files);
      setLoadingDetails(false);
    } else {
      setLoadingDetails(false);
    }
  };

  // Extract dynamic filter options
  const filterOptions = useMemo(() => {
    const organisms = new Set<string>();
    const expTypes = new Set<string>();

    results.forEach(hit => {
      const orgs = hit._source["organism"];
      if (orgs) {
        if (Array.isArray(orgs)) {
          orgs.forEach(o => { if(o) organisms.add(o) });
        } else if (typeof orgs === 'string') {
          organisms.add(orgs);
        }
      }

      const exp = hit._source["Study Assay Measurement Type"];
      if (exp) expTypes.add(exp);
    });

    return {
      organisms: ['All', ...Array.from(organisms)],
      expTypes: ['All', ...Array.from(expTypes)]
    };
  }, [results]);

  // Apply filters and sort
  const filteredResults = useMemo(() => {
    return results.filter(hit => {
      const orgMatch = selectedOrganism === 'All' || (hit._source["organism"] && 
        (Array.isArray(hit._source["organism"]) ? hit._source["organism"].includes(selectedOrganism) : hit._source["organism"] === selectedOrganism));
      const expMatch = selectedExpType === 'All' || hit._source["Study Assay Measurement Type"] === selectedExpType;
      return orgMatch && expMatch;
    }).sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = a._source["Study Public Release Date"] ? new Date(a._source["Study Public Release Date"]).getTime() : 0;
        const dateB = b._source["Study Public Release Date"] ? new Date(b._source["Study Public Release Date"]).getTime() : 0;
        return dateB - dateA;
      }
      return b._score - a._score;
    });
  }, [results, selectedOrganism, selectedExpType, sortBy]);

  return (
    <div className="flex flex-col h-screen overflow-hidden text-on-surface bg-surface">
      {viewState !== 'welcome' && <Header />}
      
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {viewState === 'welcome' && (
            <Welcome onExplore={() => setViewState('search')} />
          )}

          {viewState === 'search' && (
            <DataExplorer 
              query={query}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleSearch={handleSearch}
              loading={loading}
              error={error}
              filteredResults={filteredResults}
              filterOptions={filterOptions}
              selectedOrganism={selectedOrganism}
              setSelectedOrganism={setSelectedOrganism}
              selectedExpType={selectedExpType}
              setSelectedExpType={setSelectedExpType}
              handleSelectResult={handleSelectResult}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          )}

          {viewState === 'details' && selectedResult && (
            <DatasetDetails 
              selectedResult={selectedResult}
              detailedMeta={detailedMeta}
              studyFiles={studyFiles}
              loadingDetails={loadingDetails}
              onBack={() => setViewState('search')}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
