import React from 'react';
import { MapPin, Database } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Maps Data Extractor</h1>
            <p className="text-xs text-slate-500 font-medium">Targeted Business Lead Generation</p>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
           <Database className="w-4 h-4" />
           <span>Ready to Export</span>
        </div>
      </div>
    </header>
  );
};

export default Header;