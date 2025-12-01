import React, { useState } from 'react';
import Header from './components/Header';
import ResultsTable from './components/ResultsTable';
import { searchPlaces } from './services/geminiService';
import { PlaceData, ScrapeStatus } from './types';
import { convertToCSV, downloadCSV } from './utils/parser';
import { Search, Download, RefreshCw, AlertCircle, Loader2, MapPin, Layers, FileSpreadsheet } from 'lucide-react';

const PRESET_CATEGORIES = [
  "Coffee Shops",
  "Restaurants",
  "Hotels",
  "Hospitals",
  "Gyms & Fitness",
  "Pharmacies",
  "Supermarkets",
  "Banks",
  "Real Estate Agencies",
  "Car Repair"
];

export default function App() {
  // Search State
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState(PRESET_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Data State
  const [data, setData] = useState<PlaceData[]>([]);
  const [status, setStatus] = useState<ScrapeStatus>({ loading: false, error: null, complete: false });

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'custom') {
      setIsCustomCategory(true);
      setCategory('');
    } else {
      setIsCustomCategory(false);
      setCategory(val);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCategory = isCustomCategory ? customCategory : category;
    
    if (!location.trim() || !finalCategory.trim()) {
      return;
    }

    const fullQuery = `${finalCategory} in ${location}`;

    setStatus({ loading: true, error: null, complete: false });
    setData([]);

    try {
      const result = await searchPlaces(fullQuery);
      setData(result.data);
      if (result.data.length === 0) {
        setStatus({ loading: false, error: "No business data found. Try refining the location or category.", complete: true });
      } else {
        setStatus({ loading: false, error: null, complete: true });
      }
    } catch (err: any) {
      setStatus({ loading: false, error: err.message, complete: true });
    }
  };

  const handleExport = () => {
    if (data.length === 0) return;
    const finalCategory = isCustomCategory ? customCategory : category;
    const csv = convertToCSV(data);
    const filename = `${finalCategory}-${location}`.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.csv';
    downloadCSV(csv, filename);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search Section */}
        <section className="mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">Extraction Settings</h2>
            
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Location Input */}
                <div className="space-y-2">
                  <label htmlFor="location" className="block text-sm font-medium text-slate-700">
                    Target Location (City, Country)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Baku, Azerbaijan"
                      className="block w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none placeholder-slate-400"
                      disabled={status.loading}
                      required
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-medium text-slate-700">
                    Business Category
                  </label>
                  <div className="flex space-x-2">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Layers className="h-5 w-5 text-slate-400" />
                      </div>
                      {!isCustomCategory ? (
                        <select
                          id="category"
                          value={category}
                          onChange={handleCategoryChange}
                          className="block w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none bg-white appearance-none"
                          disabled={status.loading}
                        >
                          {PRESET_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="custom">Other (Type custom...)</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="e.g. Vegan Restaurants"
                          className="block w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none placeholder-slate-400"
                          disabled={status.loading}
                          autoFocus
                          onBlur={() => {
                            if (!customCategory.trim()) {
                              setIsCustomCategory(false);
                              setCategory(PRESET_CATEGORIES[0]);
                            }
                          }}
                        />
                      )}
                    </div>
                    {isCustomCategory && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(false);
                          setCategory(PRESET_CATEGORIES[0]);
                        }}
                        className="px-3 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status.loading || !location.trim()}
                  className={`w-full md:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white transition-all
                    ${status.loading || !location.trim() ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}
                  `}
                >
                  {status.loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Extracting {isCustomCategory ? customCategory : category} in {location}...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5" />
                      Start Extraction
                    </>
                  )}
                </button>
              </div>
            </form>
            <p className="mt-4 text-sm text-slate-500 border-t border-slate-100 pt-3">
              Select a category and location to generate a targeted list of businesses with addresses, ratings, and contact info.
            </p>
          </div>
        </section>

        {/* Status Messages */}
        {status.error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Extraction Failed</h3>
              <p className="mt-1 text-sm text-red-700">{status.error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        <section className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">
              {data.length > 0 ? `Found ${data.length} Results` : 'Extracted Data'}
            </h2>
            <button
              onClick={handleExport}
              disabled={data.length === 0}
              className={`flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium transition-colors
                ${data.length === 0 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-sm border-transparent'}
              `}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export to Excel
            </button>
          </div>

          <div className="flex-grow">
            <ResultsTable data={data} />
          </div>
        </section>

      </main>
    </div>
  );
}