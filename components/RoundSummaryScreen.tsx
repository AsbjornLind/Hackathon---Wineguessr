import React from 'react';
import { motion } from 'framer-motion';
import { Room } from '../types';
import { Map } from './Map';
import { UsersIcon, CheckCircleIcon } from './icons';

interface RoundSummaryScreenProps {
    room: Room;
    isHost: boolean;
    onNextRound: () => void;
}

export const RoundSummaryScreen: React.FC<RoundSummaryScreenProps> = ({ room, isHost, onNextRound }) => {
    const currentRoundIndex = room.currentWineIndex;
    const currentWine = room.wines[currentRoundIndex];
    const playerGuesses = room.guesses[currentRoundIndex];

    const allPlayers = room.players.map(player => {
        const guess = playerGuesses[player.id];
        return {
            ...player,
            score: guess ? guess.score : 0,
            distance: guess ? guess.distance : Infinity,
        };
    }).sort((a, b) => b.score - a.score);

    // Create a GameResult-like object for the map to display all pins
    const mapResult = {
        wine: currentWine,
        // The 'guess' property here is a bit of a hack.
        // The map component expects a single guess, but we want to show all.
        // We'll pass the first player's guess, but also pass the full list of player guesses
        // so the map can render them all.
        guess: playerGuesses[room.players[0].id].guess,
        distance: 0, // Not used for the summary map
        score: 0, // Not used for the summary map
        allPlayerGuesses: playerGuesses,
    };
    
    // Calculate cumulative scores for the leaderboard
    const leaderboard = room.players.map(player => {
        const totalScore = room.guesses.reduce((acc, roundGuesses) => {
            return acc + (roundGuesses[player.id]?.score || 0);
        }, 0);
        return { ...player, totalScore };
    }).sort((a,b) => b.totalScore - a.totalScore);


    return (
        <div className="relative min-h-screen w-full flex flex-col md:flex-row">
            {/* Results Info Panel */}
            <motion.div 
                className="w-full md:w-1/3 lg:w-1/4 bg-white shadow-lg p-6 flex flex-col"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
                <div className="flex-grow">
                    <div className="border-b pb-4 border-stone-200">
                        <h1 className="text-3xl font-bold text-rose-900">Round Summary</h1>
                        <p className="text-stone-500">The wine was <span className="font-bold">{currentWine.name}</span></p>
                    </div>

                    <div className="mt-6">
                         <h3 className="font-bold text-stone-500 flex items-center mb-2"><CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />ROUND SCORES</h3>
                         <ul className="space-y-2 text-sm">
                             {allPlayers.map((player) => (
                                 <li key={player.id} className="flex justify-between p-2 bg-stone-50 rounded">
                                     <span className="font-medium text-stone-700">{player.name}</span>
                                     <span className="font-bold text-rose-800">{player.score.toLocaleString()} pts</span>
                                 </li>
                             ))}
                         </ul>
                    </div>
                    
                     <div className="mt-6">
                         <h3 className="font-bold text-stone-500 flex items-center mb-2"><UsersIcon className="h-5 w-5 mr-2" />LEADERBOARD</h3>
                         <ul className="space-y-2 text-sm">
                             {leaderboard.map((player, index) => (
                                 <li key={player.id} className="flex justify-between p-2 bg-stone-50 rounded">
                                     <div className="flex items-center">
                                        <span className="font-bold text-stone-400 w-6">{index + 1}.</span>
                                        <span className="font-medium text-stone-700">{player.name}</span>
                                     </div>
                                     <span className="font-bold text-rose-800">{player.totalScore.toLocaleString()} pts</span>
                                 </li>
                             ))}
                         </ul>
                    </div>

                </div>

                {isHost ? (
                    <motion.button
                        onClick={onNextRound}
                        className="w-full mt-6 bg-rose-800 text-white font-bold py-4 px-4 rounded-lg hover:bg-rose-900 transition-colors duration-300 text-lg"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                      {room.currentWineIndex === room.wines.length - 1 ? 'Finish Game' : 'Next Round'}
                    </motion.button>
                ) : (
                     <div className="w-full mt-6 text-center bg-stone-100 text-stone-600 font-bold py-4 px-4 rounded-lg">
                        Waiting for host to continue...
                    </div>
                )}
            </motion.div>
            
            {/* Map Panel */}
            <div className="flex-grow h-64 md:h-screen">
                <Map
                    onGuess={() => {}} // No guessing on this screen
                    isGuessing={false}
                    result={mapResult as any} // Pass the special result object
                />
            </div>
        </div>
    );
};
