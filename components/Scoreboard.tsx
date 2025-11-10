import React from 'react';
import { motion } from 'framer-motion';
import { GameResult } from '../types';
import { TrophyIcon, UsersIcon } from './icons';

interface ScoreboardProps {
  results: GameResult[] | { playerId: string; name: string; totalScore: number }[];
  onRestart: () => void;
  onNewGame: () => void;
  isMultiplayer: boolean;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ results, onRestart, onNewGame, isMultiplayer }) => {
  
  if (isMultiplayer) {
    const finalScores = (results as { playerId: string; name: string; totalScore: number }[]).sort((a,b) => b.totalScore - a.totalScore);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-xl shadow-2xl text-center border border-stone-200"
          >
            <TrophyIcon className="h-20 w-20 mx-auto text-amber-500" />
            <h1 className="text-5xl font-bold font-serif text-rose-900 mt-4">Game Over!</h1>
            <p className="text-stone-600 mt-2">Here are the final results:</p>
            
            <div className="mt-10">
                <h3 className="text-xl font-bold text-stone-700 flex items-center justify-center">
                    <UsersIcon className="h-6 w-6 mr-2" />
                    Final Leaderboard
                </h3>
                <div className="mt-4 max-h-80 overflow-y-auto pr-2">
                    <ul className="space-y-3 text-left">
                        {finalScores.map((player, index) => (
                            <li key={player.playerId} className="flex justify-between items-center p-4 bg-stone-50 rounded-md">
                                <div className="flex items-center">
                                    <span className="text-lg font-bold text-stone-400 w-8">{index + 1}</span>
                                    <p className="font-bold text-stone-800 truncate">{player.name}</p>
                                </div>
                                <p className="font-bold text-rose-800">{player.totalScore.toLocaleString()} pts</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={onNewGame}
                    className="w-full bg-rose-800 text-white font-bold py-3 px-8 rounded-lg hover:bg-rose-900 transition-colors duration-300"
                >
                    Return to Home
                </button>
            </div>
          </motion.div>
        </div>
    );
  }

  // Solo Scoreboard
  const soloResults = results as GameResult[];
  const totalScore = soloResults.reduce((sum, r) => sum + r.score, 0);
  const averageDistance = soloResults.reduce((sum, r) => sum + r.distance, 0) / soloResults.length;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-xl shadow-2xl text-center border border-stone-200"
      >
        <TrophyIcon className="h-20 w-20 mx-auto text-amber-500" />
        <h1 className="text-5xl font-bold font-serif text-rose-900 mt-4">Game Over!</h1>
        <p className="text-stone-600 mt-2">Here's how you did:</p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-stone-50 p-6 rounded-lg">
                <p className="text-sm font-bold text-stone-500">TOTAL SCORE</p>
                <p className="text-5xl font-bold text-rose-900">{totalScore.toLocaleString()}</p>
            </div>
             <div className="bg-stone-50 p-6 rounded-lg">
                <p className="text-sm font-bold text-stone-500">AVERAGE DISTANCE</p>
                <p className="text-5xl font-bold text-rose-900">{averageDistance.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-2xl text-stone-500">km</span></p>
            </div>
        </div>

        <div className="mt-10">
            <h3 className="text-xl font-bold text-stone-700">Your Guesses</h3>
            <div className="mt-4 max-h-60 overflow-y-auto pr-2">
                <ul className="space-y-3 text-left">
                    {soloResults.map((r, index) => (
                        <li key={index} className="flex justify-between items-center p-3 bg-stone-50 rounded-md">
                            <div className="flex-1 mr-4">
                                <p className="font-bold text-stone-800 truncate">{r.wine.name}</p>
                                <p className="text-sm text-stone-500">{r.distance.toLocaleString(undefined, { maximumFractionDigits: 0 })} km away</p>
                            </div>
                            <p className="font-bold text-rose-800">{r.score.toLocaleString()} pts</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button
                onClick={onRestart}
                className="w-full sm:w-auto bg-rose-800 text-white font-bold py-3 px-8 rounded-lg hover:bg-rose-900 transition-colors duration-300"
            >
                Play Again
            </button>
            <button
                onClick={onNewGame}
                className="w-full sm:w-auto bg-stone-200 text-stone-800 font-bold py-3 px-8 rounded-lg hover:bg-stone-300 transition-colors duration-300"
            >
                New Wine List
            </button>
        </div>

      </motion.div>
    </div>
  );
};
