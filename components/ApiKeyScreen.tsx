
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon } from './icons';

interface ApiKeyScreenProps {
  onKeySubmit: (key: string) => void;
  error?: string;
}

export const ApiKeyScreen: React.FC<ApiKeyScreenProps> = ({ onKeySubmit, error }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onKeySubmit(key.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-stone-50">
      <motion.div
        className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl text-center border border-stone-200"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <MapPinIcon className="h-16 w-16 mx-auto text-rose-800" />
        <h1 className="text-3xl font-bold font-serif text-rose-900 mt-4">Google Maps API Key</h1>
        {error ? (
           <p className="mt-4 text-red-600 bg-red-100 p-3 rounded-md">{error}</p>
        ) : (
            <p className="text-stone-600 mt-4">
            WineGuessr requires a Google Maps API key to display the map. Please provide your key to continue.
            </p>
        )}
        <p className="text-stone-500 mt-2 text-sm">
          Your key is stored only in your browser's local storage for convenience.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full mt-4 p-3 border border-stone-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
            placeholder="Enter your Google Maps API Key"
            aria-label="Google Maps API Key"
          />
          <button
            type="submit"
            disabled={!key.trim()}
            className="w-full bg-rose-800 text-white font-bold py-3 px-8 rounded-lg hover:bg-rose-900 transition-colors duration-300 disabled:bg-rose-400 disabled:cursor-not-allowed"
          >
            Save &amp; Start Game
          </button>
        </form>
        <div className="mt-6 text-xs text-stone-500">
          <p>
            You can get a key from the{' '}
            <a href="https://console.cloud.google.com/google/maps-apis/overview" target="_blank" rel="noopener noreferrer" className="text-rose-700 hover:underline">
              Google Cloud Console
            </a>.
          </p>
          <p className="mt-1">
            Ensure the <strong>Maps JavaScript API</strong> and <strong>Generative Language API</strong> are enabled for your key.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
