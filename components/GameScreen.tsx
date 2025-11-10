import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, GameResult, GameState, Coordinates, Room } from '../types';
import { Map } from './Map';
import { ResultsModal } from './ResultsModal';
import { WineGlassIcon, UsersIcon, CheckCircleIcon } from './icons';

interface GameScreenProps {
  wine: Wine;
  round: string;
  onGuess: (guess: Coordinates) => void;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  result: GameResult | undefined; // For solo mode modal
  onNextRound: () => void;
  room: Room | null;
  playerId: string | null;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  wine,
  round,
  onGuess,
  gameState,
  setGameState,
  result,
  onNextRound,
  room,
  playerId,
}) => {
  const isGuessing = gameState === 'guessing';
  const isMultiplayer = !!room;
  
  const currentGuesses = room ? room.guesses[room.currentWineIndex] || {} : {};
  const playerHasGuessed = playerId ? !!currentGuesses[playerId] : false;
  const allPlayersGuessed = room ? room.players.length === Object.keys(currentGuesses).length : false;


  const renderPlayerStatus = () => {
    if (!room) return null;
    return (
        <div className="mt-6 border-t pt-4 border-stone-200">
            <h3 className="font-bold text-stone-500 flex items-center mb-2"><UsersIcon className="h-5 w-5 mr-2" />PLAYERS</h3>
            <ul className="space-y-2">
                {room.players.map(p => {
                    const hasGuessed = !!(room.guesses[room.currentWineIndex] && room.guesses[room.currentWineIndex][p.id]);
                    return (
                        <li key={p.id} className="flex items-center justify-between text-sm">
                            <span className={`font-medium ${p.id === playerId ? 'text-rose-800' : 'text-stone-700'}`}>
                                {p.name} {p.id === playerId ? '(You)' : ''}
                            </span>
                            {hasGuessed ? (
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            ) : (
                                <span className="text-xs text-stone-400">Guessing...</span>
                            )}
                        </li>
                    )
                })}
            </ul>
        </div>
    );
  }

  const renderActionButton = () => {
    if (gameState === 'result') return null; // Solo mode shows modal
    
    if (playerHasGuessed) {
        return (
             <div className="w-full mt-6 text-center bg-stone-100 text-stone-600 font-bold py-4 px-4 rounded-lg">
                Waiting for other players...
            </div>
        )
    }

    if (isGuessing) {
        return null; // The map shows the confirm button
    }
    
    return (
        <motion.button
            onClick={() => setGameState('guessing')}
            className="w-full mt-6 bg-rose-800 text-white font-bold py-4 px-4 rounded-lg hover:bg-rose-900 transition-colors duration-300 text-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            Guess Location
        </motion.button>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row">
      <AnimatePresence>
        {!isMultiplayer && result && gameState === 'result' && (
          <ResultsModal result={result} onNext={onNextRound} />
        )}
      </AnimatePresence>

      {/* Wine Info Panel */}
      <motion.div 
        className="w-full md:w-1/3 lg:w-1/4 bg-white shadow-lg p-6 flex flex-col"
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <div className="flex-grow">
            <div className="flex justify-between items-center border-b pb-4 border-stone-200">
                <div>
                    <h1 className="text-3xl font-bold text-rose-900">WineGuessr</h1>
                    <p className="text-stone-500">{round}</p>
                </div>
                <WineGlassIcon className="h-10 w-10 text-rose-300" />
            </div>

            <div className="mt-6 space-y-4 text-sm">
                <h2 className="text-2xl font-serif text-stone-800">{wine.name}</h2>
                <p className="text-stone-600 italic">{wine.description}</p>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                        <p className="font-bold text-stone-500">GRAPE</p>
                        <p className="text-lg text-stone-800">{wine.grape}</p>
                    </div>
                    <div>
                        <p className="font-bold text-stone-500">YEAR</p>
                        <p className="text-lg text-stone-800">{wine.year}</p>
                    </div>
                    <div>
                        <p className="font-bold text-stone-500">PRICE</p>
                        <p className="text-lg text-stone-800">${wine.price.toFixed(2)}</p>
                    </div>
                </div>
            </div>
             {isMultiplayer && renderPlayerStatus()}
        </div>
        {renderActionButton()}
      </motion.div>
      
      {/* Map Panel */}
      <div className="flex-grow h-64 md:h-screen">
         <Map
            onGuess={onGuess}
            isGuessing={isGuessing && !playerHasGuessed}
            result={result}
         />
      </div>
    </div>
  );
};
