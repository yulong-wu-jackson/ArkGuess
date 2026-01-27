import type { Character, CellMarkers } from './index'

/**
 * Valid message types for type guard validation.
 */
const VALID_MESSAGE_TYPES = [
  'room_info',
  'player_ready',
  'game_start',
  'character_selected',
  'marker_update',
  'final_guess',
  'counter_guess_required',
  'game_result',
  'rematch',
  'return_lobby',
  'player_left',
  'emote',
] as const

/**
 * Valid emote IDs for type guard validation.
 */
const VALID_EMOTE_IDS = ['cooperate', 'happy', 'scared', 'sorry', 'thanks', 'thinking'] as const

/**
 * Type guard to check if a value is a valid MessageType.
 */
function isValidMessageType(value: unknown): value is MessageType {
  return typeof value === 'string' && VALID_MESSAGE_TYPES.includes(value as MessageType)
}

/**
 * Type guard to check if a value is a valid EmoteId.
 */
function isValidEmoteId(value: unknown): value is EmoteId {
  return typeof value === 'string' && VALID_EMOTE_IDS.includes(value as EmoteId)
}

/**
 * Validates and type-guards an incoming message from a peer.
 * Returns the message if valid, null if invalid.
 */
export function validateMultiplayerMessage(data: unknown): MultiplayerMessage | null {
  // Basic structure check
  if (typeof data !== 'object' || data === null) {
    console.warn('[Multiplayer] Invalid message: not an object')
    return null
  }

  const msg = data as Record<string, unknown>

  // Check required base fields
  if (!isValidMessageType(msg.type)) {
    console.warn('[Multiplayer] Invalid message type:', msg.type)
    return null
  }

  if (typeof msg.timestamp !== 'number') {
    console.warn('[Multiplayer] Invalid message timestamp:', msg.timestamp)
    return null
  }

  // Check payload exists for types that require it
  if (msg.type !== 'game_start' && msg.payload === undefined) {
    // game_start can have empty payload
    if (!['room_info', 'player_ready', 'character_selected', 'marker_update',
         'final_guess', 'counter_guess_required', 'game_result', 'rematch',
         'return_lobby', 'player_left', 'emote'].includes(msg.type)) {
      return data as MultiplayerMessage
    }
    if (typeof msg.payload !== 'object' || msg.payload === null) {
      console.warn('[Multiplayer] Invalid message payload for type:', msg.type)
      return null
    }
  }

  // Type-specific validation
  const payload = msg.payload as Record<string, unknown> | undefined

  switch (msg.type) {
    case 'emote':
      if (!payload || !isValidEmoteId(payload.emoteId)) {
        console.warn('[Multiplayer] Invalid emote message')
        return null
      }
      break
    case 'player_ready':
      if (!payload || typeof payload.playerId !== 'string' || typeof payload.isReady !== 'boolean') {
        console.warn('[Multiplayer] Invalid player_ready message')
        return null
      }
      break
    case 'final_guess':
      if (!payload || typeof payload.playerId !== 'string' ||
          typeof payload.guessedCharacterId !== 'string' ||
          typeof payload.mySecretCharacterId !== 'string') {
        console.warn('[Multiplayer] Invalid final_guess message')
        return null
      }
      break
    case 'marker_update':
      if (!payload || typeof payload.playerId !== 'string' ||
          typeof payload.cellIndex !== 'number' ||
          typeof payload.markers !== 'object') {
        console.warn('[Multiplayer] Invalid marker_update message')
        return null
      }
      break
    // Other message types have looser validation - accept if base structure is correct
  }

  return data as MultiplayerMessage
}

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
  | 'emote'

/**
 * Available emote identifiers.
 */
export type EmoteId = 'cooperate' | 'happy' | 'scared' | 'sorry' | 'thanks' | 'thinking'

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
 * Emote message for sending expressions to opponent.
 */
export interface EmoteMessage extends BaseMessage {
  type: 'emote'
  payload: {
    playerId: string
    emoteId: EmoteId
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
  | EmoteMessage

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
  myFinalGuessTimestamp: number | null  // Timestamp when we submitted our guess (for race condition handling)
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
  opponentDisconnected: boolean  // True when opponent's connection is lost
  // Marker state for multiplayer game
  myMarkers: CellMarkers[]
  opponentMarkers: CellMarkers[]
  currentView: MarkerView
  // Final decision state
  mustCounterGuess: boolean
  initiatorId: string | null
  // Emote state
  receivedEmote: { emoteId: EmoteId; timestamp: number } | null
}
