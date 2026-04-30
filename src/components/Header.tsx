import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-['Space_Grotesk'] tracking-tight border-b border-slate-200 dark:border-slate-800 flex justify-between items-center px-6 py-3 w-full sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-primary-container flex items-center justify-center rounded">
          <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>science</span>
        </div>
        <span className="text-xl font-bold tracking-tighter text-[#0B1D33] dark:text-slate-100">Omics Data Engine <span className="text-sm font-normal text-slate-500">by CiscoExplains</span></span>
      </div>
      <div className="flex items-center gap-4">
        <a href="https://osdr.nasa.gov" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-500 hover:text-primary-container transition-colors hidden sm:block">
          NASA OSDR Official
        </a>
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><span className="material-symbols-outlined text-on-surface-variant">help_outline</span></button>
        </div>
      </div>
    </header>
  );
};

export default Header;
