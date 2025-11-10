import React from 'react';
import { motion } from 'framer-motion';
import { WineGlassIcon, UsersIcon } from './icons';

interface HomeScreenProps {
  onSelectMode: (mode: 'solo' | 'multiplayer') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-stone-50">
      <motion.div 
        className="text-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <WineGlassIcon className="h-20 w-20 mx-auto text-rose-800" />
        <h1 className="text-6xl md:text-7xl font-bold text-rose-900 mt-4">WineGuessr</h1>
        <p className="text-stone-600 mt-2 text-lg">A worldly wine tasting adventure.</p>
      </motion.div>

      <motion.div 
        className="w-full max-w-md mt-16 space-y-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <button
          onClick={() => onSelectMode('solo')}
          className="w-full text-left p-6 bg-white rounded-lg shadow-lg border border-stone-200 hover:border-rose-300 hover:bg-rose-50 transition-all duration-300 flex items-center group"
        >
          <WineGlassIcon className="h-10 w-10 text-rose-700 mr-6" />
          <div>
            <h2 className="text-2xl font-bold text-stone-800">Single Player</h2>
            <p className="text-stone-500">Play a solo game at your own pace.</p>
          </div>
        </button>
        <button
          onClick={() => onSelectMode('multiplayer')}
          className="w-full text-left p-6 bg-white rounded-lg shadow-lg border border-stone-200 hover:border-rose-300 hover:bg-rose-50 transition-all duration-300 flex items-center group"
        >
          <UsersIcon className="h-10 w-10 text-rose-700 mr-6" />
          <div>
            <h2 className="text-2xl font-bold text-stone-800">Multiplayer</h2>
            <p className="text-stone-500">Create or join a room to play with friends.</p>
          </div>
        </button>
      </motion.div>
    </div>
  );
};
