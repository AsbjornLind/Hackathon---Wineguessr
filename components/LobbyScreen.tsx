import React from 'react';
import { motion } from 'framer-motion';
import { Player, Wine, Room } from '../types';
import { UsersIcon, WineGlassIcon, CheckCircleIcon } from './icons';
import { SetupScreen } from './SetupScreen';

interface LobbyScreenProps {
  room: Room;
  currentPlayer: Player;
  onStartGame: (wines: Wine[]) => void;
  onLeave: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ room, currentPlayer, onStartGame, onLeave }) => {

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    alert('Room code copied to clipboard!');
  };
  
  // The host is presented with the same wine selection UI as single player.
  if (currentPlayer.isHost) {
      return (
          <div className="min-h-screen flex flex-col md:flex-row">
            <div className="w-full md:w-2/3">
                 <SetupScreen onWinesLoaded={onStartGame} onBack={onLeave} />
            </div>
            <div className="w-full md:w-1/3 bg-white p-6 shadow-lg border-l border-stone-200 flex flex-col">
                <PlayerList roomCode={room.code} onCopyCode={handleCopyCode} players={room.players} />
                 <p className="mt-auto text-center text-sm text-stone-500">
                    As the host, select a wine list to begin the game for everyone.
                </p>
            </div>
          </div>
      );
  }

  // Non-host players see a waiting screen.
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
       <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-2xl border border-stone-200">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <PlayerList roomCode={room.code} onCopyCode={handleCopyCode} players={room.players} />
                <div className="text-center mt-8">
                    <WineGlassIcon className="h-16 w-16 mx-auto text-rose-300 animate-pulse" />
                    <h2 className="text-2xl font-bold text-stone-800 mt-4">Waiting for Host...</h2>
                    <p className="text-stone-500">The host is selecting a wine list. The game will begin shortly.</p>
                </div>
                 <button onClick={onLeave} className="w-full mt-8 bg-stone-200 text-stone-700 font-bold py-3 rounded-lg hover:bg-stone-300 transition-colors">
                    Leave Room
                </button>
            </motion.div>
       </div>
    </div>
  );
};

const PlayerList: React.FC<{ roomCode: string, onCopyCode: () => void, players: Player[] }> = ({ roomCode, onCopyCode, players }) => (
    <div>
        <h1 className="text-3xl font-bold text-rose-900">Lobby</h1>
        <p className="text-stone-500">Players will appear here as they join.</p>

        <div className="mt-6">
            <label className="text-sm font-bold text-stone-500">ROOM CODE</label>
            <div 
                className="mt-1 flex items-center justify-between bg-stone-100 p-3 rounded-lg cursor-pointer hover:bg-stone-200"
                onClick={onCopyCode}
                title="Copy Code"
            >
                <span className="text-2xl font-mono tracking-widest text-stone-800">{roomCode}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </div>
        </div>

        <div className="mt-8">
            <h3 className="text-lg font-bold text-stone-700 flex items-center">
                <UsersIcon className="h-6 w-6 mr-2" />
                Players ({players.length})
            </h3>
            <ul className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-2">
                {players.map((player) => (
                    <motion.li
                        key={player.id}
                        className="flex items-center p-3 bg-stone-50 rounded-md"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        layout
                    >
                        <span className="font-bold text-stone-800">{player.name}</span>
                        {player.isHost && <span className="ml-2 text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">HOST</span>}
                    </motion.li>
                ))}
            </ul>
        </div>
    </div>
);
