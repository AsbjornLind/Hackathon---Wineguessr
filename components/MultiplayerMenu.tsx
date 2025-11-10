import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UsersIcon, LoginIcon, LeftArrowIcon } from './icons';

interface MultiplayerMenuProps {
  onCreateRoom: (playerName: string) => void;
  onJoinRoom: (playerName: string, roomCode: string) => void;
  onBack: () => void;
}

export const MultiplayerMenu: React.FC<MultiplayerMenuProps> = ({ onCreateRoom, onJoinRoom, onBack }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onCreateRoom(playerName.trim());
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && roomCode.trim()) {
      onJoinRoom(playerName.trim(), roomCode.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-stone-50 relative">
        <button onClick={onBack} className="absolute top-6 left-6 text-stone-500 hover:text-rose-800 transition-colors">
            <LeftArrowIcon className="h-8 w-8" />
        </button>
      <motion.div
        className="text-center mb-12"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <UsersIcon className="h-16 w-16 mx-auto text-rose-800" />
        <h1 className="text-5xl font-bold text-rose-900 mt-4">Multiplayer</h1>
        <p className="text-stone-600 mt-2 text-lg">Play with friends across the globe.</p>
      </motion.div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create Room */}
        <motion.div 
            className="bg-white p-8 rounded-lg shadow-lg border border-stone-200"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-stone-800">Create a New Room</h2>
          <p className="text-stone-500 mt-1 text-sm">Start a new game and invite your friends.</p>
          <form onSubmit={handleCreate} className="mt-6">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-3 border border-stone-300 rounded-md focus:ring-2 focus:ring-rose-500"
              placeholder="Enter your name"
              required
            />
            <button
              type="submit"
              className="w-full mt-4 bg-rose-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-rose-900 transition-colors disabled:bg-rose-400"
              disabled={!playerName.trim()}
            >
              Create Room
            </button>
          </form>
        </motion.div>

        {/* Join Room */}
        <motion.div 
            className="bg-white p-8 rounded-lg shadow-lg border border-stone-200"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-stone-800">Join an Existing Room</h2>
          <p className="text-stone-500 mt-1 text-sm">Enter a room code to join a game.</p>
          <form onSubmit={handleJoin} className="mt-6 space-y-4">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-3 border border-stone-300 rounded-md focus:ring-2 focus:ring-rose-500"
              placeholder="Enter your name"
              required
            />
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full p-3 border border-stone-300 rounded-md focus:ring-2 focus:ring-rose-500"
              placeholder="Enter Room Code"
              maxLength={4}
              required
            />
            <button
              type="submit"
              className="w-full bg-stone-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-stone-800 transition-colors disabled:bg-stone-400"
              disabled={!playerName.trim() || !roomCode.trim()}
            >
              Join Room
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
