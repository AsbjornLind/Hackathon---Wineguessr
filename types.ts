// Fix: Removed self-importing line which caused declaration conflicts.
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Wine {
  name: string;
  price: number;
  description: string;
  country: string;
  winefarm_coordinates: Coordinates;
  grape: string;
  year: number;
}

export interface GameResult {
  wine: Wine;
  guess: Coordinates;
  distance: number;
  score: number;
}

export type GameState = 'home' | 'setup' | 'multiplayer-menu' | 'lobby' | 'playing' | 'result' | 'summary' | 'mp-round-summary';

export interface Player {
    id: string;
    name: string;
    isHost?: boolean;
}

// Multiplayer-specific types
export type RoomStatus = 'lobby' | 'playing' | 'round-summary' | 'game-over';

export interface PlayerGuess {
    [playerId: string]: GameResult;
}

export interface Room {
    code: string;
    players: Player[];
    wines: Wine[];
    currentWineIndex: number;
    status: RoomStatus;
    guesses: PlayerGuess[]; // Array index corresponds to wine index
}