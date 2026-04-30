import React from 'react';
import { motion } from 'framer-motion';

interface WelcomeProps {
  onExplore: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onExplore }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#f7f9fb] flex items-center justify-center overflow-hidden font-['Space_Grotesk']">
      {/* Background Decorative Elements - Soft & Light */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-50/40 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[15%] h-[15%] bg-blue-50/30 blur-[80px] rounded-full" />
      </div>

      <div className="max-w-4xl px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/5 border border-primary-container/10 text-primary-container text-sm font-bold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            Next-Gen Omics Exploration
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-[#0B1D33] tracking-tighter mb-6 leading-tight">
            Omics Data Engine
            <span className="block text-2xl md:text-3xl font-normal text-slate-500 mt-2">by CiscoExplains</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10 font-['Inter']">
            A premium, high-performance search engine for genomic, proteomic, and space biology data. 
            Unified access to NASA Open Science Data Repository and NCBI GEO.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="flex flex-col md:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onExplore}
            className="group relative px-8 py-4 bg-[#0B1D33] text-white rounded-xl font-bold text-lg hover:bg-[#1a2d44] transition-all duration-300 shadow-lg shadow-blue-900/10"
          >
            Start Exploring
            <span className="material-symbols-outlined align-middle ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
          
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-8 py-4 bg-white text-[#0B1D33] rounded-xl font-bold text-lg border border-slate-200 hover:bg-slate-50 transition-all duration-300"
          >
            Documentation
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-200 pt-10"
        >
          <div>
            <div className="text-[#0B1D33] font-bold text-2xl">30k+</div>
            <div className="text-slate-400 text-sm font-medium">Datasets</div>
          </div>
          <div>
            <div className="text-[#0B1D33] font-bold text-2xl">NASA</div>
            <div className="text-slate-400 text-sm font-medium">OSDR Sync</div>
          </div>
          <div>
            <div className="text-[#0B1D33] font-bold text-2xl">NCBI</div>
            <div className="text-slate-400 text-sm font-medium">GEO Library</div>
          </div>
          <div>
            <div className="text-[#0B1D33] font-bold text-2xl">100%</div>
            <div className="text-slate-400 text-sm font-medium">Open Science</div>
          </div>
        </motion.div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20">
        <div className="w-[1px] h-12 bg-gradient-to-b from-transparent to-[#0B1D33]" />
        <span className="text-[10px] uppercase tracking-widest text-[#0B1D33] font-bold">Scientific Discovery</span>
      </div>
    </div>
  );
};

export default Welcome;
