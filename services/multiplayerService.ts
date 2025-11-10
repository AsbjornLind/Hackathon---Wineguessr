import { Room, Player, Coordinates, Wine } from '../types';
import { calculateDistance, calculateScore } from '../utils/geo';
import { shuffleArray } from '../utils/array';

const getRoomKey = (roomCode: string) => `wineguessr_room_${roomCode}`;

// --- State Management ---

export const getRoomState = (roomCode: string): Room | null => {
    const roomData = localStorage.getItem(getRoomKey(roomCode));
    return roomData ? JSON.parse(roomData) : null;
};

const setRoomState = (room: Room) => {
    localStorage.setItem(getRoomKey(room.code), JSON.stringify(room));
};

// --- Room Actions ---

export const createRoom = (hostName: string) => {
    const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const hostId = `player_${Date.now()}`;
    const host: Player = { id: hostId, name: hostName, isHost: true };

    const newRoom: Room = {
        code: roomCode,
        players: [host],
        wines: [],
        currentWineIndex: 0,
        status: 'lobby',
        guesses: [],
    };
    
    setRoomState(newRoom);
    return { player: host, room: newRoom };
};

export const joinRoom = (roomCode: string, playerName: string) => {
    const room = getRoomState(roomCode.toUpperCase());
    if (!room) {
        throw new Error('Room not found.');
    }
    if (room.status !== 'lobby') {
        throw new Error('Game has already started.');
    }

    const newPlayerId = `player_${Date.now()}`;
    const newPlayer: Player = { id: newPlayerId, name: playerName, isHost: false };
    
    room.players.push(newPlayer);
    setRoomState(room);

    return { player: newPlayer, room };
};

export const leaveRoom = (roomCode: string, playerId: string) => {
    const room = getRoomState(roomCode);
    if (!room) return;

    room.players = room.players.filter(p => p.id !== playerId);

    // If no players are left, remove the room
    if (room.players.length === 0) {
        localStorage.removeItem(getRoomKey(roomCode));
        return;
    }

    // If the host leaves, assign a new host
    const hostLeft = !room.players.some(p => p.isHost);
    if (hostLeft && room.players.length > 0) {
        room.players[0].isHost = true;
    }
    
    setRoomState(room);
}


// --- Game Actions ---

export const startGame = (roomCode: string, wines: Wine[]): Room | null => {
    const room = getRoomState(roomCode);
    if (!room) return null;

    room.wines = shuffleArray(wines);
    room.status = 'playing';
    room.currentWineIndex = 0;
    room.guesses = wines.map(() => ({})); // Initialize guess objects for each round
    
    setRoomState(room);
    return room;
};

export const submitGuess = (roomCode: string, playerId: string, guess: Coordinates): Room | null => {
    const room = getRoomState(roomCode);
    if (!room || room.status !== 'playing') return null;

    const currentWine = room.wines[room.currentWineIndex];
    const distance = calculateDistance(guess, currentWine.winefarm_coordinates);
    const score = calculateScore(distance);

    const result = { wine: currentWine, guess, distance, score };
    
    if (!room.guesses[room.currentWineIndex]) {
        room.guesses[room.currentWineIndex] = {};
    }
    room.guesses[room.currentWineIndex][playerId] = result;

    // Check if all players have guessed
    const allPlayersGuessed = room.players.length === Object.keys(room.guesses[room.currentWineIndex]).length;
    if (allPlayersGuessed) {
        room.status = 'round-summary';
    }

    setRoomState(room);
    return room;
};

export const nextRound = (roomCode: string): Room | null => {
    const room = getRoomState(roomCode);
    if (!room) return null;

    if (room.currentWineIndex < room.wines.length - 1) {
        room.currentWineIndex++;
        room.status = 'playing';
    } else {
        room.status = 'game-over';
    }

    setRoomState(room);
    return room;
}

export const getFinalScores = (room: Room) => {
    return room.players.map(player => {
        const totalScore = room.guesses.reduce((acc, roundGuesses) => {
            return acc + (roundGuesses[player.id]?.score || 0);
        }, 0);
        return { playerId: player.id, name: player.name, totalScore };
    }).sort((a, b) => b.totalScore - a.totalScore);
};


// --- Real-time Updates ---

export const listenForUpdates = (roomCode: string, callback: (room: Room | null) => void) => {
    const roomKey = getRoomKey(roomCode);
    
    const handler = (event: StorageEvent) => {
        if (event.key === roomKey) {
            callback(event.newValue ? JSON.parse(event.newValue) : null);
        }
    };
    
    window.addEventListener('storage', handler);
    
    // Return a cleanup function
    return () => {
        window.removeEventListener('storage', handler);
    };
};