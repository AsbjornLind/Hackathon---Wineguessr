
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wine } from '../types';
import { SAMPLE_WINES_JSON } from '../constants';
import { WineGlassIcon, UploadIcon, DownloadIcon, LeftArrowIcon } from './icons';

interface SetupScreenProps {
  onWinesLoaded: (wines: Wine[]) => void;
  onBack: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onWinesLoaded, onBack }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          setError(null);
          const content = e.target?.result as string;
          const wines = JSON.parse(content) as Wine[];
          onWinesLoaded(wines);
        } catch (err) {
          setError('Invalid JSON file. Please check the format.');
        }
      };
      reader.onerror = () => {
        setError('Failed to read the file.');
      };
      reader.readAsText(file);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_WINES_JSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-wines.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-stone-50 relative">
       <button onClick={onBack} className="absolute top-6 left-6 text-stone-500 hover:text-rose-800 transition-colors">
            <LeftArrowIcon className="h-8 w-8" />
       </button>

      <motion.div 
        className="text-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <WineGlassIcon className="h-16 w-16 mx-auto text-rose-800" />
        <h1 className="text-5xl font-bold text-rose-900 mt-4">Game Setup</h1>
        <p className="text-stone-600 mt-2 text-lg">Load a wine list to begin your game.</p>
      </motion.div>

      <motion.div 
        className="w-full max-w-md mt-12"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* File Upload Card */}
        <div className="bg-white p-8 rounded-lg shadow-lg border border-stone-200 flex flex-col">
          <div className="flex items-center text-rose-800">
            <UploadIcon className="h-8 w-8 mr-3" />
            <h2 className="text-2xl font-bold">Upload Your Wine List</h2>
          </div>
          <p className="text-stone-500 mt-2 flex-grow">Provide a JSON file to start the game. Download the sample file to see the required format.</p>
          <div className="mt-6 space-y-4">
            <label htmlFor="file-upload" className="w-full cursor-pointer bg-rose-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-rose-900 transition-colors duration-300 flex items-center justify-center text-lg">
                <UploadIcon className="h-5 w-5 mr-2" />
                Select JSON File
            </label>
            <input id="file-upload" type="file" accept=".json" className="hidden" onChange={handleFileChange} />
            <button onClick={downloadSample} className="w-full text-sm text-stone-500 hover:text-rose-800 flex items-center justify-center">
                <DownloadIcon className="h-4 w-4 mr-1" />
                Download Sample JSON
            </button>
          </div>
        </div>
      </motion.div>
      {error && <p className="mt-6 text-red-600 bg-red-100 p-3 rounded-md w-full max-w-md text-center">{error}</p>}
    </div>
  );
};
