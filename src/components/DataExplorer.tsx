import React from 'react';
import { motion } from 'framer-motion';

interface DataExplorerProps {
  query: string;
  searchTerm: string;
  setSearchTerm: (q: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
  filteredResults: any[];
  filterOptions: any;
  selectedOrganism: string;
  setSelectedOrganism: (v: string) => void;
  selectedExpType: string;
  setSelectedExpType: (v: string) => void;
  handleSelectResult: (hit: any) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
}

const DataExplorer: React.FC<DataExplorerProps> = ({
  query, searchTerm, setSearchTerm, handleSearch,
  loading, error, filteredResults, filterOptions,
  selectedOrganism, setSelectedOrganism,
  selectedExpType, setSelectedExpType,
  handleSelectResult, sortBy, setSortBy
}) => {
  const [viewMode, setViewMode] = React.useState('list'); // 'list', 'grid'

  const formatSource = (source: string) => {
    const map: Record<string, string> = {
      'mg_rast': 'MG-RAST',
      'nih_geo': 'GEO',
      'ebi_pride': 'PRIDE',
      'cgene': 'NASA OSD / GeneLab'
    };
    return map[source] || source?.toUpperCase() || '';
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface">
      {/* Search & Control Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-3">
        <form onSubmit={handleSearch} className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded focus:ring-2 focus:ring-primary-container focus:border-transparent font-body-sm transition-all text-on-surface" 
              placeholder="Search biological datasets, missions, or organisms..." 
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button type="submit" className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-600 hover:bg-slate-300">ENTER</button>
            </div>
          </div>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4 h-8">
            <button 
              type="button" 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded flex items-center transition-colors ${viewMode === 'list' ? 'bg-secondary-container text-on-secondary-container' : 'text-slate-400 hover:bg-slate-100'}`} 
              title="List View"
            >
              <span className="material-symbols-outlined">list</span>
            </button>
            <button 
              type="button" 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded flex items-center transition-colors ${viewMode === 'grid' ? 'bg-secondary-container text-on-secondary-container' : 'text-slate-400 hover:bg-slate-100'}`} 
              title="Grid View"
            >
              <span className="material-symbols-outlined">grid_view</span>
            </button>
            <div className="w-px h-4 bg-slate-300 mx-2"></div>
            <div className="relative group">
              <button 
                type="button" 
                className="flex items-center gap-2 text-body-sm font-medium text-slate-700 bg-white border border-outline-variant px-3 py-1.5 rounded hover:bg-slate-50 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">sort</span>
                {sortBy === 'relevance' ? 'Relevance' : 'Release Date'}
              </button>
              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded shadow-lg hidden group-hover:block z-50">
                <button 
                  type="button"
                  onClick={() => setSortBy('relevance')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${sortBy === 'relevance' ? 'font-bold text-primary-container' : 'text-slate-600'}`}
                >
                  Relevance
                </button>
                <button 
                  type="button"
                  onClick={() => setSortBy('date')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${sortBy === 'date' ? 'font-bold text-primary-container' : 'text-slate-600'}`}
                >
                  Release Date
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="max-w-[1200px] w-full mx-auto px-6 py-6 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Faceted Filters */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6 overflow-y-auto pr-2 custom-scrollbar max-h-full">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md text-sm font-bold uppercase tracking-widest text-slate-500">Filters</h3>
            <button 
              onClick={() => { setSelectedOrganism('All'); setSelectedExpType('All'); }}
              className="text-label-caps text-on-tertiary-container hover:underline"
            >
              Clear All
            </button>
          </div>

          {/* Organism Filter */}
          <div className="space-y-3">
            <p className="font-label-caps text-slate-900 border-b border-slate-200 pb-1">Organism</p>
            <div className="space-y-2">
              {filterOptions.organisms.slice(0, 8).map((org: string) => (
                <label key={org} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={selectedOrganism === org}
                    onChange={() => setSelectedOrganism(org)}
                    className="rounded border-outline-variant text-primary-container focus:ring-primary-container" 
                  />
                  <span className="text-body-sm text-on-surface-variant group-hover:text-on-surface truncate">{org}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Assay Type Filter */}
          <div className="space-y-3">
            <p className="font-label-caps text-slate-900 border-b border-slate-200 pb-1">Assay Type</p>
            <div className="space-y-2">
              {filterOptions.expTypes.slice(0, 8).map((exp: string) => (
                <label key={exp} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={selectedExpType === exp}
                    onChange={() => setSelectedExpType(exp)}
                    className="rounded border-outline-variant text-primary-container focus:ring-primary-container" 
                  />
                  <span className="text-body-sm text-on-surface-variant group-hover:text-on-surface truncate">{exp}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <div className="flex-1 space-y-4 overflow-y-auto pb-8 custom-scrollbar relative">
          {loading ? (
            <div className="flex justify-center items-center py-20 text-blue-500">
              <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200">
              {error}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center px-2">
                <span className="text-body-sm text-slate-500 italic">Showing {filteredResults.length} studies found for "{query}"</span>
              </div>

              {filteredResults.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded p-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">search_off</span>
                  <p className="text-slate-500">No omics data found matching your criteria.</p>
                </div>
              ) : viewMode === 'list' ? (
                <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-label-caps text-slate-600">Study ID</th>
                        <th className="px-4 py-3 text-label-caps text-slate-600">Title & Metadata</th>
                        <th className="px-4 py-3 text-label-caps text-slate-600">Organism</th>
                        <th className="px-4 py-3 text-label-caps text-slate-600">Assay</th>
                        <th className="px-4 py-3 text-label-caps text-slate-600 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredResults.map((hit, index) => (
                        <motion.tr 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(index * 0.05, 0.5) }}
                          key={hit._id}
                          className="hover:bg-slate-50 transition-colors group cursor-pointer"
                          onClick={() => handleSelectResult(hit)}
                        >
                          <td className="px-4 py-4 align-top w-32">
                            <span className="font-data-mono text-xs font-bold text-primary-container bg-secondary-container/30 px-2 py-0.5 rounded border border-primary-container/20">
                              {hit._source.Accession}
                            </span>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <div className="space-y-1">
                              <h4 className="font-headline-md text-[14px] leading-tight text-[#0B1D33] group-hover:underline">
                                {hit._source["Study Title"] || hit._source["Project Title"] || "Untitled Study"}
                              </h4>
                              <div className="flex gap-3 text-[11px] text-slate-500 uppercase tracking-wide mt-2">
                                <span>Source: {formatSource(hit._source["Data Source Type"])}</span>
                                {hit._source["Study Public Release Date"] && (
                                  <>
                                    <span className="text-slate-300">|</span>
                                    <span>Released: {typeof hit._source["Study Public Release Date"] === 'string' ? hit._source["Study Public Release Date"].split('T')[0] : String(hit._source["Study Public Release Date"])}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 align-top w-48">
                            <span className="text-body-sm italic text-slate-700">
                              {Array.isArray(hit._source["organism"]) ? hit._source["organism"].join(", ") : (hit._source["organism"] || "N/A")}
                            </span>
                          </td>
                          <td className="px-4 py-4 align-top w-40">
                            <div className="flex flex-wrap gap-1">
                              {hit._source["Study Assay Measurement Type"] ? (
                                String(hit._source["Study Assay Measurement Type"])
                                  .split(/[;,]/)
                                  .filter(a => a.trim() !== '')
                                  .slice(0, 2)
                                  .map((assay, i) => (
                                    <span key={i} className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded max-w-[130px] truncate block" title={assay.trim()}>
                                      {assay.trim()}
                                    </span>
                                  ))
                              ) : (
                                <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded">N/A</span>
                              )}
                              {hit._source["Study Assay Measurement Type"] && String(hit._source["Study Assay Measurement Type"]).split(/[;,]/).filter(a => a.trim() !== '').length > 2 && (
                                <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                                  +{String(hit._source["Study Assay Measurement Type"]).split(/[;,]/).filter(a => a.trim() !== '').length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 align-top text-right space-x-1 whitespace-nowrap w-32">
                            <button className="p-1.5 text-slate-400 hover:text-primary-container transition-colors" title="Bookmark">
                              <span className="material-symbols-outlined text-[20px]">bookmark_border</span>
                            </button>
                            <button className="p-1.5 text-primary-container hover:bg-slate-100 rounded transition-colors" title="Explore Files" onClick={(e) => { e.stopPropagation(); handleSelectResult(hit); }}>
                              <span className="material-symbols-outlined text-[20px]">folder_open</span>
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {filteredResults.map((hit, index) => (
                    <motion.div
                      key={hit._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: Math.min(index * 0.05, 0.5) }}
                      className="bg-white border border-slate-200 rounded-xl p-5 hover:border-primary-container hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-full"
                      onClick={() => handleSelectResult(hit)}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="font-data-mono text-[10px] font-bold text-primary-container bg-secondary-container/30 px-2 py-0.5 rounded border border-primary-container/20 uppercase tracking-wider">
                            {hit._source.Accession}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatSource(hit._source["Data Source Type"])}</span>
                        </div>
                        <h4 className="font-headline-md text-sm leading-tight text-[#0B1D33] group-hover:text-primary-container transition-colors mb-3 line-clamp-2">
                          {hit._source["Study Title"] || hit._source["Project Title"] || "Untitled Study"}
                        </h4>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {hit._source["Study Assay Measurement Type"] && String(hit._source["Study Assay Measurement Type"]).split(/[;,]/).filter(a => a.trim() !== '').slice(0, 3).map((assay, i) => (
                            <span key={i} className="text-[10px] bg-slate-50 border border-slate-100 text-slate-500 px-2 py-0.5 rounded">{assay.trim()}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <span className="text-[11px] italic text-slate-500">{Array.isArray(hit._source["organism"]) ? hit._source["organism"][0] : (hit._source["organism"] || "N/A")}</span>
                        <div className="flex gap-1">
                           <button className="p-1.5 text-slate-400 hover:text-primary-container transition-colors"><span className="material-symbols-outlined text-[18px]">bookmark_border</span></button>
                           <button className="p-1.5 text-primary-container hover:bg-slate-50 rounded transition-colors"><span className="material-symbols-outlined text-[18px]">arrow_forward</span></button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataExplorer;
