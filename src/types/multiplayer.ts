import type { Character, CellMarkers } from './index'

/**
 * Message types for multiplayer communication protocol.
 * Each message type corresponds to a specific game action or state sync.
 */
export type MessageType =
  | 'room_info'
  | 'player_ready'
  | 'game_start'
  | 'character_selected'
  | 'marker_update'
  | 'final_guess'
  | 'counter_guess_required'
  | 'game_result'
  | 'rematch'
  | 'return_lobby'
  | 'player_left'

/**
 * Player role in the game session.
 */
export type PlayerRole = 'host' | 'guest'

/**
 * Connection status for the peer.
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

/**
 * Player information in a multiplayer session.
 */
export interface Player {
  id: string
  role: PlayerRole
  isReady: boolean
  hasSelectedCharacter: boolean
}

/**
 * Room configuration and state.
 */
export interface RoomState {
  roomCode: string
  hostId: string
  players: Player[]
  gameStarted: boolean
  selectedCharacters: Character[]
  gridSize: number
  themeId: string
}

/**
 * Base interface for all multiplayer messages.
 */
export interface BaseMessage {
  type: MessageType
  timestamp: number
}

/**
 * Room information sync message (sent by host to guest).
 */
export interface RoomInfoMessage extends BaseMessage {
  type: 'room_info'
  payload: {
    roomCode: string
    hostId: string
    players: Player[]
    selectedCharacters: Character[]
    gridSize: number
    themeId: string
  }
}

/**
 * Player ready status change message.
 */
export interface PlayerReadyMessage extends BaseMessage {
  type: 'player_ready'
  payload: {
    playerId: string
    isReady: boolean
  }
}

/**
 * Game start signal message (sent by host).
 */
export interface GameStartMessage extends BaseMessage {
  type: 'game_start'
  payload: {
    gameCells: Array<{ characterId: string; markers: CellMarkers }>
  }
}

/**
 * Character selection confirmation (does not reveal which character).
 */
export interface CharacterSelectedMessage extends BaseMessage {
  type: 'character_selected'
  payload: {
    playerId: string
  }
}

/**
 * Marker update sync message.
 */
export interface MarkerUpdateMessage extends BaseMessage {
  type: 'marker_update'
  payload: {
    playerId: string
    cellIndex: number
    markers: CellMarkers
  }
}

/**
 * Final guess submission.
 * Includes both the guessed character and the guesser's own secret for result calculation.
 */
export interface FinalGuessMessage extends BaseMessage {
  type: 'final_guess'
  payload: {
    playerId: string
    guessedCharacterId: string
    mySecretCharacterId: string
  }
}

/**
 * Counter-guess required notification.
 */
export interface CounterGuessRequiredMessage extends BaseMessage {
  type: 'counter_guess_required'
  payload: {
    initiatorGuessedCharacterId: string
    initiatorId: string
  }
}

/**
 * Game result announcement.
 */
export interface GameResultMessage extends BaseMessage {
  type: 'game_result'
  payload: {
    winnerId: string | null
    hostSecretCharacterId: string
    guestSecretCharacterId: string
    initiatorId: string
    initiatorGuessCorrect: boolean
    counterGuessCorrect?: boolean
  }
}

/**
 * Rematch request.
 */
export interface RematchMessage extends BaseMessage {
  type: 'rematch'
  payload: {
    playerId: string
  }
}

/**
 * Return to lobby request.
 */
export interface ReturnLobbyMessage extends BaseMessage {
  type: 'return_lobby'
  payload: {
    playerId: string
  }
}

/**
 * Player disconnection notification.
 */
export interface PlayerLeftMessage extends BaseMessage {
  type: 'player_left'
  payload: {
    playerId: string
  }
}

/**
 * Union type for all possible messages.
 */
export type MultiplayerMessage =
  | RoomInfoMessage
  | PlayerReadyMessage
  | GameStartMessage
  | CharacterSelectedMessage
  | MarkerUpdateMessage
  | FinalGuessMessage
  | CounterGuessRequiredMessage
  | GameResultMessage
  | RematchMessage
  | ReturnLobbyMessage
  | PlayerLeftMessage

/**
 * Game phase in multiplayer mode.
 */
export type GamePhase =
  | 'lobby'
  | 'character_selection'
  | 'playing'
  | 'waiting_for_result'
  | 'finished'

/**
 * View mode for multiplayer game board.
 */
export type MarkerView = 'my' | 'opponent'

/**
 * Multiplayer game state.
 */
export interface MultiplayerGameState {
  phase: GamePhase
  roomState: RoomState | null
  connectionStatus: ConnectionStatus
  myRole: PlayerRole | null
  mySecretCharacter: Character | null
  opponentHasSelectedCharacter: boolean
  myFinalGuess: Character | null
  opponentFinalGuess: Character | null
  opponentSecretCharacter: Character | null  // Revealed when opponent sends final_guess
  gameResult: {
    winnerId: string | null
    hostSecretCharacterId: string
    guestSecretCharacterId: string
    initiatorId: string
    initiatorGuessCorrect: boolean
    counterGuessCorrect?: boolean
  } | null
  error: string | null
  // Marker state for multiplayer game
  myMarkers: CellMarkers[]
  opponentMarkers: CellMarkers[]
  currentView: MarkerView
  // Final decision state
  mustCounterGuess: boolean
  initiatorId: string | null
}
