import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SetupScreen } from './components/SetupScreen';
import { GameScreen } from './components/GameScreen';
import { Scoreboard } from './components/Scoreboard';
import { HomeScreen } from './components/HomeScreen';
import { MultiplayerMenu } from './components/MultiplayerMenu';
import { LobbyScreen } from './components/LobbyScreen';
import { RoundSummaryScreen } from './components/RoundSummaryScreen';
import { Wine, GameResult, Coordinates, GameState, Player, Room } from './types';
import { calculateDistance, calculateScore } from './utils/geo';
import { shuffleArray } from './utils/array';
import { MapPinIcon } from './components/icons';
import * as multiplayerService from './services/multiplayerService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('home');
  const [wines, setWines] = useState<Wine[]>([]);
  const [currentWineIndex, setCurrentWineIndex] = useState(0);
  const [results, setResults] = useState<GameResult[]>([]);
  
  const [isMapScriptLoaded, setMapScriptLoaded] = useState(false);
  const [mapScriptError, setMapScriptError] = useState(false);

  const apiKey = "AIzaSyA480jvUe2ZB87av4y1gaVLrlZzd713A98";

  // --- Multiplayer State ---
  const [room, setRoom] = useState<Room | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  
  const currentPlayer = useMemo(() => {
    if (!playerId || !room) return null;
    return room.players.find(p => p.id === playerId) ?? null;
  }, [playerId, room]);

  const handleNewGame = useCallback(() => {
    if (room?.code && playerId) {
        multiplayerService.leaveRoom(room.code, playerId);
    }
    setGameState('home');
    setWines([]);
    setResults([]);
    setCurrentWineIndex(0);
    setRoom(null);
    setPlayerId(null);
  }, [room, playerId]);
  
  const handleUpdate = useCallback((newRoomState: Room | null) => {
    setRoom(newRoomState);
    if (newRoomState) {
        switch(newRoomState.status) {
            case 'lobby':
                setGameState('lobby');
                break;
            case 'playing':
                setGameState('playing');
                break;
            case 'round-summary':
                setGameState('mp-round-summary');
                break;
            case 'game-over':
                setGameState('summary');
                break;
        }
    } else {
        // This case handles when the room is deleted or the player leaves,
        // ensuring they are returned to the home screen.
        handleNewGame();
    }
  }, [handleNewGame]);

  useEffect(() => {
    if (window.google) {
      setMapScriptLoaded(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=core,maps,marker`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
        setMapScriptLoaded(true);
        setMapScriptError(false);
    };

    script.onerror = () => {
        console.error('Failed to load Google Maps script. The hardcoded API Key is invalid or misconfigured.');
        setMapScriptError(true);
    };
    
    document.head.appendChild(script);

  }, [apiKey]);
  
  // Subscribe to multiplayer room updates from other tabs/players
  useEffect(() => {
    if (!room?.code) return;
    return multiplayerService.listenForUpdates(room.code, handleUpdate);
  }, [room?.code, handleUpdate]);

  const startSoloGame = useCallback((loadedWines: Wine[]) => {
    if (loadedWines.length > 0) {
      setWines(shuffleArray(loadedWines));
      setCurrentWineIndex(0);
      setResults([]);
      setGameState('playing');
    } else {
      alert('The wine list is empty. Please provide a valid file.');
    }
  }, []);
  
  const handleGameModeSelect = (mode: 'solo' | 'multiplayer') => {
    if (mode === 'solo') {
        setGameState('setup');
    } else {
        setGameState('multiplayer-menu');
    }
  };

  const handleCreateRoom = (playerName: string) => {
    const { player, room: newRoom } = multiplayerService.createRoom(playerName);
    setPlayerId(player.id);
    setRoom(newRoom);
    setGameState('lobby');
  };

  const handleJoinRoom = (playerName: string, joinedRoomCode: string) => {
    try {
      const { player, room: joinedRoom } = multiplayerService.joinRoom(joinedRoomCode, playerName);
      setPlayerId(player.id);
      setRoom(joinedRoom);
      setGameState('lobby');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An unknown error occurred.');
    }
  };
  
  const handleStartGameFromLobby = (winesForGame: Wine[]) => {
      if(room?.code) {
          const newRoom = multiplayerService.startGame(room.code, winesForGame);
          // Manually trigger the update for the host, as they won't get the storage event.
          handleUpdate(newRoom);
      }
  }

  const handleGuess = (guess: Coordinates) => {
    // Solo game logic
    if (!room) {
        const currentWine = wines[currentWineIndex];
        const distance = calculateDistance(guess, currentWine.winefarm_coordinates);
        const score = calculateScore(distance);

        const result: GameResult = {
          wine: currentWine,
          guess,
          distance,
          score,
        };
        setResults(prev => [...prev, result]);
        setGameState('result');
        return;
    }
    
    // Multiplayer game logic
    if (room && playerId) {
        const newRoom = multiplayerService.submitGuess(room.code, playerId, guess);
        // Manually trigger the update for the player who guessed.
        handleUpdate(newRoom);
    }
  };

  const handleNextRound = () => {
    // Solo game
    if (!room) {
        if (currentWineIndex < wines.length - 1) {
          setCurrentWineIndex(prev => prev + 1);
          setGameState('playing');
        } else {
          setGameState('summary');
        }
        return;
    }
    // Multiplayer game
    if (room && currentPlayer?.isHost) {
        const newRoom = multiplayerService.nextRound(room.code);
        // Manually trigger the update for the host.
        handleUpdate(newRoom);
    }
  };

  const handleRestart = () => {
    startSoloGame(wines);
  };

  const renderContent = () => {
    switch (gameState) {
      case 'home':
        return (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <HomeScreen onSelectMode={handleGameModeSelect} />
            </motion.div>
        )
      case 'setup':
        return (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SetupScreen onWinesLoaded={startSoloGame} onBack={() => setGameState('home')} />
          </motion.div>
        );
      case 'multiplayer-menu':
        return (
            <motion.div key="multiplayer-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <MultiplayerMenu onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} onBack={() => setGameState('home')} />
            </motion.div>
        );
      case 'lobby':
        return (
            <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LobbyScreen 
                    room={room!} 
                    currentPlayer={currentPlayer!} 
                    onStartGame={handleStartGameFromLobby}
                    onLeave={handleNewGame}
                />
            </motion.div>
        )
      case 'playing':
      case 'guessing':
      case 'result':
        if (!isMapScriptLoaded) {
             return (
               <div className="flex flex-col items-center justify-center h-screen text-center">
                    <MapPinIcon className="h-12 w-12 text-rose-800 animate-bounce" />
                    <p className="mt-4 text-lg font-semibold text-stone-700">Loading Map...</p>
                    <p className="text-stone-500">Just a moment while we get things ready.</p>
               </div>
            );
        }
        const gameWine = room ? room.wines[room.currentWineIndex] : wines[currentWineIndex];
        const round = room ? `${room.currentWineIndex + 1} / ${room.wines.length}` : `${currentWineIndex + 1} / ${wines.length}`;
        const result = room ? undefined : results[currentWineIndex]; // Solo mode result modal
        
        return (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GameScreen
              wine={gameWine}
              round={round}
              onGuess={handleGuess}
              gameState={gameState}
              setGameState={setGameState}
              result={result}
              onNextRound={handleNextRound}
              room={room}
              playerId={playerId}
            />
          </motion.div>
        );
      case 'mp-round-summary':
        return (
             <motion.div key="mp-summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <RoundSummaryScreen 
                    room={room!} 
                    isHost={!!currentPlayer?.isHost}
                    onNextRound={handleNextRound} 
                />
             </motion.div>
        );
      case 'summary':
          const finalResults = room ? multiplayerService.getFinalScores(room) : results;
          const isMultiplayer = !!room;
          return (
            <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Scoreboard 
                    results={finalResults} 
                    onRestart={handleRestart} 
                    onNewGame={handleNewGame}
                    isMultiplayer={isMultiplayer}
                />
            </motion.div>
        );
      default:
        return null;
    }
  };
  
  if (mapScriptError) {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center p-4 bg-stone-50">
            <MapPinIcon className="h-16 w-16 text-red-600" />
            <h1 className="mt-4 text-3xl font-bold font-serif text-red-800">Map Loading Failed</h1>
            <p className="text-stone-600 mt-2 max-w-md">
                Could not load Google Maps. The provided API Key might be invalid, expired, or missing necessary permissions (Maps JavaScript API).
            </p>
             <p className="text-stone-500 mt-2 text-sm">Please check the console for more details.</p>
        </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
};

export default App;