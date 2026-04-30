import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface DatasetDetailsProps {
  selectedResult: any;
  detailedMeta: any;
  studyFiles: any[];
  loadingDetails: boolean;
  onBack: () => void;
}

const DatasetDetails: React.FC<DatasetDetailsProps> = ({
  selectedResult, detailedMeta, studyFiles, loadingDetails, onBack
}) => {
  const [activeTab, setActiveTab] = useState('summary');

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const title = detailedMeta?.title || selectedResult._source["Study Title"] || selectedResult._source["Project Title"];
  const description = detailedMeta?.description || selectedResult._source["Study Description"];
  const organism = Array.isArray(selectedResult._source["organism"]) ? selectedResult._source["organism"].join(", ") : (selectedResult._source["organism"] || "N/A");
  const releaseDateRaw = selectedResult._source["Study Public Release Date"];
  const releaseDate = typeof releaseDateRaw === 'string' ? releaseDateRaw.split('T')[0] : (releaseDateRaw ? String(releaseDateRaw) : 'Unknown');

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface overflow-y-auto custom-scrollbar">
      <div className="max-w-[1200px] mx-auto w-full p-8">
        {/* Breadcrumb & Navigation */}
        <div className="mb-4">
          <button onClick={onBack} className="flex items-center gap-1 text-slate-500 hover:text-primary-container text-sm font-medium transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Search
          </button>
        </div>

        {/* Study Header */}
        <div className="flex justify-between items-start mb-8 gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-label-caps rounded font-bold">{selectedResult._source.Accession}</span>
              <span className="text-slate-500 font-data-mono text-xs max-w-[200px] truncate block" title={String(selectedResult._source["Study Assay Measurement Type"] || '')}>
                {selectedResult._source["Study Assay Measurement Type"] 
                  ? String(selectedResult._source["Study Assay Measurement Type"]).split(/[;,]/)[0].trim() 
                  : 'N/A'}
              </span>
            </div>
            <h1 className="font-headline-lg text-primary">{title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-body-sm text-secondary mt-2">
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">calendar_today</span>Released: {releaseDate}</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">biotech</span>Organism: {organism}</span>
              {studyFiles.length > 0 && (
                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">folder_open</span>Files: {studyFiles.length}</span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-outline rounded text-body-md font-medium hover:bg-slate-100 flex items-center gap-2 bg-white">
              <span className="material-symbols-outlined text-[20px]">share</span>
              Share
            </button>
            <a 
              href={selectedResult._source["Data Source Type"] === "NCBI GEO" 
                ? `https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=${selectedResult._source.Accession}`
                : `https://osdr.nasa.gov/bio/repo/data/studies/${selectedResult._source.Accession}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-primary-container text-white rounded font-medium hover:opacity-90 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">open_in_new</span>
              View Repository
            </a>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="border-b border-outline-variant flex gap-8 mb-8 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('summary')}
            className={`pb-3 border-b-2 font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'summary' ? 'border-primary-container text-primary' : 'border-transparent text-secondary hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-[20px]">description</span> Summary
          </button>
          <button 
            onClick={() => setActiveTab('files')}
            className={`pb-3 border-b-2 font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'files' ? 'border-primary-container text-primary' : 'border-transparent text-secondary hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-[20px]">folder_zip</span> Files
          </button>
          <button 
            onClick={() => setActiveTab('publications')}
            className={`pb-3 border-b-2 font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'publications' ? 'border-primary-container text-primary' : 'border-transparent text-secondary hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-[20px]">library_books</span> Publications
          </button>
        </div>

        {loadingDetails ? (
           <div className="flex justify-center items-center py-20 text-blue-500">
             <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
             <span className="ml-3 font-medium">Fetching detailed data from NASA OSDR...</span>
           </div>
        ) : (
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 space-y-6">
                  <section className="bg-white p-6 rounded border border-outline-variant">
                    <h2 className="font-headline-md text-primary mb-4 text-xl">Study Background</h2>
                    <p className="text-body-md text-on-surface-variant leading-relaxed">
                      {description || "No description provided."}
                    </p>
                  </section>
                  
                  {detailedMeta?.people && detailedMeta.people.length > 0 && (
                    <section className="bg-white p-6 rounded border border-outline-variant">
                      <h2 className="font-headline-md text-primary mb-4 text-xl flex items-center gap-2">
                        <span className="material-symbols-outlined">group</span> Investigators
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {detailedMeta.people.map((p: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-100">
                            <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-sm">
                              {p.firstName?.[0]}{p.lastName?.[0]}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-800">{p.firstName} {p.lastName}</p>
                              {p.role && <p className="text-xs text-slate-500">{p.role}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                <div className="md:col-span-4 space-y-6">
                  <div className="bg-slate-50 p-6 rounded border border-outline-variant">
                    <h3 className="font-label-caps text-secondary uppercase mb-4">Investigation Details</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Accession</div>
                        <div className="text-body-sm font-semibold text-primary-container">{selectedResult._source.Accession}</div>
                      </div>
                      {selectedResult._source["Project Title"] && (
                        <div>
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Project</div>
                          <div className="text-body-sm font-semibold">{selectedResult._source["Project Title"]}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Assay Technology</div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedResult._source["Study Assay Measurement Type"] ? (
                            String(selectedResult._source["Study Assay Measurement Type"])
                              .split(/[;,]/)
                              .filter(a => a.trim() !== '')
                              .map((assay, i) => (
                                <span key={i} className="text-xs bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded">
                                  {assay.trim()}
                                </span>
                              ))
                          ) : (
                            <span className="text-body-sm font-semibold text-slate-400">N/A</span>
                          )}
                        </div>
                      </div>
                      {selectedResult._source["Study Funding Agency"] && (
                        <div>
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Funding Agency</div>
                          <div className="text-body-sm font-semibold">{selectedResult._source["Study Funding Agency"]}</div>
                        </div>
                      )}
                      {selectedResult._source["Managing NASA Center"] && (
                        <div>
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Managing Center</div>
                          <div className="text-body-sm font-semibold">{selectedResult._source["Managing NASA Center"]}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative rounded overflow-hidden h-48 border border-outline-variant bg-slate-900">
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfCvY7Pa_yXHGYImQMkacabC_P0bcFDQ0386XdqxkiwyYR9uup7XQdRxo0C-_-2vKhp_IXzikd0p7PjS-MyELc7obOylT-gKH0ORbaPyaEHs5siWN-WgqlWfs4_2skOLAxvKb3dJOM9nxqb8EGksiNnGhktGnb2kySNmpW_Uw4v-qlNeLlWQr4jOl8hLRMjOJ0ykjk6hjnhtZsl0LCYhI1mmLev8sWPhII7qKvSyvqWl0H5uZ-7Wvfb34byrR4tN-7bMN5iCNvCAIs" 
                      alt="ISS Space Station" 
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                      <span className="text-white text-[10px] font-bold uppercase tracking-widest">Environment</span>
                      <span className="text-white font-medium text-sm">Space Biological Research</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Files Tab */}
            {activeTab === 'files' && (
              <div className="bg-white border border-outline-variant rounded-xl overflow-hidden">
                <div className="p-4 border-b border-outline-variant bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-white border border-outline-variant px-3 py-1.5 rounded text-body-sm text-on-surface-variant font-medium">
                    <span className="material-symbols-outlined text-sm text-primary-container">folder_open</span>
                    <span className="font-bold text-primary-container">{selectedResult._source.Accession}</span>
                    <span className="text-slate-300">/</span>
                    <span>All Files</span>
                  </div>
                  <div className="text-xs font-bold text-slate-500 uppercase">
                    {studyFiles.length} Total Files
                  </div>
                </div>
                
                {studyFiles.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">folder_off</span>
                    <p>No downloadable files found for this dataset.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-outline-variant">
                          <th className="p-4 font-label-caps text-on-surface-variant uppercase tracking-wider">File Name</th>
                          <th className="p-4 font-label-caps text-on-surface-variant uppercase tracking-wider">Category</th>
                          <th className="p-4 font-label-caps text-on-surface-variant uppercase tracking-wider">Size</th>
                          <th className="p-4 font-label-caps text-on-surface-variant uppercase tracking-wider text-right">Download</th>
                        </tr>
                      </thead>
                      <tbody className="text-body-sm">
                        {studyFiles.map((file: any, i: number) => (
                          <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-secondary">
                                  {file.file_name.endsWith('.pdf') ? 'picture_as_pdf' : 
                                   file.file_name.endsWith('.csv') || file.file_name.endsWith('.tsv') ? 'table_chart' :
                                   file.file_name.endsWith('.zip') || file.file_name.endsWith('.gz') ? 'folder_zip' : 'description'}
                                </span>
                                <span className="font-medium text-slate-800 break-all">{file.file_name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-on-surface-variant text-xs">
                              <span className="bg-slate-100 px-2 py-1 rounded">{file.category || 'Data'}</span>
                            </td>
                            <td className="p-4 text-on-surface-variant font-data-mono">{formatBytes(file.file_size)}</td>
                            <td className="p-4 text-right">
                              <a 
                                href={file.remote_url.startsWith('http') ? file.remote_url : `https://osdr.nasa.gov${file.remote_url}`} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex p-2 bg-primary-container text-white rounded hover:bg-blue-800 transition-colors shadow-sm"
                                title="Download File"
                              >
                                <span className="material-symbols-outlined text-sm">download</span>
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Publications Tab */}
            {activeTab === 'publications' && (
              <div className="grid grid-cols-1 gap-4">
                {detailedMeta?.publications && detailedMeta.publications.length > 0 ? (
                  detailedMeta.publications.map((pub: any, i: number) => (
                    <div key={i} className="bg-white border border-outline-variant rounded p-6 hover:border-primary-container transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 bg-blue-50 text-blue-600 p-2 rounded-lg">
                          <span className="material-symbols-outlined">menu_book</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-primary mb-2 leading-tight">{pub.title}</h3>
                          <p className="text-sm text-slate-600 mb-3">{pub.authorList}</p>
                          {pub.doi && (
                            <a 
                              href={`https://doi.org/${pub.doi}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded"
                            >
                              <span className="material-symbols-outlined text-[16px]">link</span>
                              DOI: {pub.doi}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-slate-200 rounded p-12 text-center text-slate-500">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">article</span>
                    <p>No publications linked to this dataset yet.</p>
                  </div>
                )}
              </div>
            )}

          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DatasetDetails;
