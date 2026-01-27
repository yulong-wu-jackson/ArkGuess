import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react'
import type { DataConnection } from 'peerjs'
import { usePeer } from '@/hooks/usePeer'
import { generateRoomCode, roomCodeToPeerId } from '@/lib/peer-service'
import type { Character } from '@/types'
import type {
  MultiplayerMessage,
  ConnectionStatus,
  PlayerRole,
  Player,
  RoomState,
  GamePhase,
  MultiplayerGameState,
  MarkerView,
} from '@/types/multiplayer'
import type { CellMarkers, MarkerType } from '@/types'

/**
 * Context value interface for multiplayer functionality.
 */
interface MultiplayerContextValue {
  // Connection state
  connectionStatus: ConnectionStatus
  peerId: string | null
  error: string | null

  // Room state
  roomState: RoomState | null
  myRole: PlayerRole | null
  gamePhase: GamePhase

  // Player state
  mySecretCharacter: Character | null
  opponentHasSelectedCharacter: boolean
  myFinalGuess: Character | null
  opponentFinalGuess: Character | null
  gameResult: MultiplayerGameState['gameResult']
  mustCounterGuess: boolean

  // Marker state
  myMarkers: CellMarkers[]
  opponentMarkers: CellMarkers[]
  currentView: MarkerView
  activeMarker: MarkerType

  // Actions
  createRoom: (gridSize: number, characters: Character[]) => Promise<string>
  joinRoom: (roomCode: string) => Promise<void>
  leaveRoom: () => void
  setReady: (isReady: boolean) => void
  startGame: () => void
  selectSecretCharacter: (character: Character) => void
  toggleCellMarker: (cellIndex: number) => void
  setCurrentView: (view: MarkerView) => void
  setActiveMarker: (marker: MarkerType) => void
  submitFinalGuess: (character: Character) => void
  requestRematch: () => void
  requestReturnToLobby: () => void

  // Utilities
  isHost: boolean
  isConnected: boolean
  opponentPlayer: Player | null
}

const MultiplayerContext = createContext<MultiplayerContextValue | null>(null)

/**
 * Initial state for multiplayer game.
 */
const initialGameState: MultiplayerGameState = {
  phase: 'lobby',
  roomState: null,
  connectionStatus: 'disconnected',
  myRole: null,
  mySecretCharacter: null,
  opponentHasSelectedCharacter: false,
  myFinalGuess: null,
  opponentFinalGuess: null,
  opponentSecretCharacter: null,
  gameResult: null,
  error: null,
  myMarkers: [],
  opponentMarkers: [],
  currentView: 'my',
  mustCounterGuess: false,
  initiatorId: null,
}

export function MultiplayerProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<MultiplayerGameState>(initialGameState)
  const [activeMarker, setActiveMarkerState] = useState<MarkerType>('x')
  const hostConnectionRef = useRef<DataConnection | null>(null)

  // Message handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleMessage = useCallback((message: MultiplayerMessage, _connection?: DataConnection) => {
    switch (message.type) {
      case 'room_info':
        setGameState((prev) => ({
          ...prev,
          roomState: {
            roomCode: message.payload.roomCode,
            hostId: message.payload.hostId,
            players: message.payload.players,
            gameStarted: false,
            selectedCharacters: message.payload.selectedCharacters,
            gridSize: message.payload.gridSize,
          },
        }))
        break

      case 'player_ready':
        setGameState((prev) => {
          if (!prev.roomState) return prev
          const updatedPlayers = prev.roomState.players.map((p) =>
            p.id === message.payload.playerId ? { ...p, isReady: message.payload.isReady } : p
          )
          return {
            ...prev,
            roomState: { ...prev.roomState, players: updatedPlayers },
          }
        })
        break

      case 'game_start':
        setGameState((prev) => ({
          ...prev,
          phase: 'character_selection',
          roomState: prev.roomState ? { ...prev.roomState, gameStarted: true } : null,
        }))
        break

      case 'character_selected':
        setGameState((prev) => ({
          ...prev,
          opponentHasSelectedCharacter: true,
        }))
        break

      case 'final_guess':
        // Opponent made a guess - we need to check if they guessed our secret correctly
        setGameState((prev) => {
          const opponentGuess = prev.roomState?.selectedCharacters.find(
            (c) => c.id === message.payload.guessedCharacterId
          ) ?? null

          // Get the opponent's secret character from the message
          const opponentSecret = prev.roomState?.selectedCharacters.find(
            (c) => c.id === message.payload.mySecretCharacterId
          ) ?? null

          const isCorrect = opponentGuess?.id === prev.mySecretCharacter?.id

          // If this is the initiating guess (not a counter-guess)
          if (!prev.initiatorId) {
            if (!isCorrect) {
              // Opponent guessed wrong - we win immediately
              // We'll send game_result message
              return {
                ...prev,
                opponentFinalGuess: opponentGuess,
                opponentSecretCharacter: opponentSecret,
                // Don't change phase yet - will be set when we send result
              }
            } else {
              // Opponent guessed correctly - we must counter-guess
              return {
                ...prev,
                opponentFinalGuess: opponentGuess,
                opponentSecretCharacter: opponentSecret,
                mustCounterGuess: true,
                initiatorId: message.payload.playerId,
              }
            }
          } else {
            // This is a counter-guess response
            return {
              ...prev,
              opponentFinalGuess: opponentGuess,
              opponentSecretCharacter: opponentSecret,
            }
          }
        })
        break

      case 'counter_guess_required':
        // We guessed correctly and opponent is notifying us they must counter-guess
        setGameState((prev) => ({
          ...prev,
          phase: 'waiting_for_result',
        }))
        break

      case 'game_result':
        setGameState((prev) => ({
          ...prev,
          phase: 'finished',
          gameResult: {
            winnerId: message.payload.winnerId,
            hostSecretCharacterId: message.payload.hostSecretCharacterId,
            guestSecretCharacterId: message.payload.guestSecretCharacterId,
            initiatorId: message.payload.initiatorId,
            initiatorGuessCorrect: message.payload.initiatorGuessCorrect,
            counterGuessCorrect: message.payload.counterGuessCorrect,
          },
        }))
        break

      case 'rematch':
        // Reset for new game, keep room settings
        setGameState((prev) => ({
          ...prev,
          phase: 'character_selection',
          mySecretCharacter: null,
          opponentHasSelectedCharacter: false,
          myFinalGuess: null,
          opponentFinalGuess: null,
          opponentSecretCharacter: null,
          gameResult: null,
          myMarkers: [],
          opponentMarkers: [],
          currentView: 'my',
          mustCounterGuess: false,
          initiatorId: null,
        }))
        break

      case 'return_lobby':
        // Go back to lobby, keep connection
        setGameState((prev) => ({
          ...prev,
          phase: 'lobby',
          mySecretCharacter: null,
          opponentHasSelectedCharacter: false,
          myFinalGuess: null,
          opponentFinalGuess: null,
          opponentSecretCharacter: null,
          gameResult: null,
          myMarkers: [],
          opponentMarkers: [],
          currentView: 'my',
          mustCounterGuess: false,
          initiatorId: null,
          roomState: prev.roomState ? {
            ...prev.roomState,
            gameStarted: false,
            players: prev.roomState.players.map(p => ({ ...p, isReady: false })),
          } : null,
        }))
        break

      case 'marker_update':
        setGameState((prev) => {
          const newOpponentMarkers = [...prev.opponentMarkers]
          newOpponentMarkers[message.payload.cellIndex] = message.payload.markers
          return {
            ...prev,
            opponentMarkers: newOpponentMarkers,
          }
        })
        break

      case 'player_left':
        setGameState((prev) => {
          if (!prev.roomState) return prev
          const updatedPlayers = prev.roomState.players.filter(
            (p) => p.id !== message.payload.playerId
          )
          return {
            ...prev,
            roomState: { ...prev.roomState, players: updatedPlayers },
            error: '对方已离开房间',
          }
        })
        break
    }
  }, [])

  // Connection handlers
  const handleConnection = useCallback(
    (conn: DataConnection) => {
      // Host receives a new connection from guest
      // Wait for connection to be open before processing
      const processConnection = () => {
        setGameState((prev) => {
          if (!prev.roomState || prev.myRole !== 'host') return prev

          const newPlayer: Player = {
            id: conn.peer,
            role: 'guest',
            isReady: false,
            hasSelectedCharacter: false,
          }

          const updatedPlayers = [...prev.roomState.players, newPlayer]
          const updatedRoomState = { ...prev.roomState, players: updatedPlayers }

          // Send room info to guest
          const roomInfoMessage: MultiplayerMessage = {
            type: 'room_info',
            timestamp: Date.now(),
            payload: {
              roomCode: updatedRoomState.roomCode,
              hostId: updatedRoomState.hostId,
              players: updatedPlayers,
              selectedCharacters: updatedRoomState.selectedCharacters,
              gridSize: updatedRoomState.gridSize,
            },
          }

          // Send directly since connection is confirmed open
          conn.send(roomInfoMessage)

          return {
            ...prev,
            roomState: updatedRoomState,
          }
        })
      }

      // Check if already open, otherwise wait for open event
      if (conn.open) {
        processConnection()
      } else {
        conn.on('open', processConnection)
      }
    },
    []
  )

  const handleConnectionClose = useCallback((conn: DataConnection) => {
    // Create and handle player left message directly (not inside setGameState)
    const playerLeftMessage: MultiplayerMessage = {
      type: 'player_left',
      timestamp: Date.now(),
      payload: { playerId: conn.peer },
    }

    handleMessage(playerLeftMessage)
  }, [handleMessage])

  const peer = usePeer({
    onData: handleMessage,
    onConnection: handleConnection,
    onConnectionClose: handleConnectionClose,
    onError: (err) => {
      setGameState((prev) => ({ ...prev, error: err.message }))
    },
  })

  // Update connection status from peer hook
  const connectionStatus = peer.status

  /**
   * Creates a new room as host.
   */
  const createRoom = useCallback(
    async (gridSize: number, characters: Character[]): Promise<string> => {
      const roomCode = generateRoomCode()
      const peerId = roomCodeToPeerId(roomCode)

      await peer.initialize({ peerId })

      const hostPlayer: Player = {
        id: peerId,
        role: 'host',
        isReady: false,
        hasSelectedCharacter: false,
      }

      setGameState({
        ...initialGameState,
        phase: 'lobby',
        connectionStatus: 'connected',
        myRole: 'host',
        roomState: {
          roomCode,
          hostId: peerId,
          players: [hostPlayer],
          gameStarted: false,
          selectedCharacters: characters,
          gridSize,
        },
      })

      return roomCode
    },
    [peer]
  )

  /**
   * Joins an existing room as guest.
   */
  const joinRoom = useCallback(
    async (roomCode: string): Promise<void> => {
      const normalizedCode = roomCode.toUpperCase().replace(/[^A-Z0-9]/g, '')
      const formattedCode = `${normalizedCode.slice(0, 3)}-${normalizedCode.slice(3, 6)}`
      const hostPeerId = roomCodeToPeerId(formattedCode)

      // Initialize our peer first
      await peer.initialize()

      // Connect to host
      const conn = await peer.connect(hostPeerId)
      hostConnectionRef.current = conn

      setGameState((prev) => ({
        ...prev,
        phase: 'lobby',
        connectionStatus: 'connected',
        myRole: 'guest',
      }))
    },
    [peer]
  )

  /**
   * Helper to send messages - handles both host and guest cases exclusively.
   */
  const sendMessage = useCallback(
    (message: MultiplayerMessage) => {
      // Guest sends only to host through stored connection
      if (gameState.myRole === 'guest' && hostConnectionRef.current?.open) {
        hostConnectionRef.current.send(message)
      }
      // Host broadcasts to all connected guests
      else if (gameState.myRole === 'host') {
        peer.broadcast(message)
      }
    },
    [peer, gameState.myRole]
  )

  /**
   * Leaves the current room.
   */
  const leaveRoom = useCallback(() => {
    // Notify other players
    const leaveMessage: MultiplayerMessage = {
      type: 'player_left',
      timestamp: Date.now(),
      payload: { playerId: peer.peerId ?? '' },
    }
    sendMessage(leaveMessage)

    peer.destroy()
    hostConnectionRef.current = null
    setGameState(initialGameState)
  }, [peer, sendMessage])

  /**
   * Sets the player's ready status.
   */
  const setReady = useCallback(
    (isReady: boolean) => {
      const message: MultiplayerMessage = {
        type: 'player_ready',
        timestamp: Date.now(),
        payload: {
          playerId: peer.peerId ?? '',
          isReady,
        },
      }

      sendMessage(message)

      // Update local state
      setGameState((prev) => {
        if (!prev.roomState) return prev
        const updatedPlayers = prev.roomState.players.map((p) =>
          p.id === peer.peerId ? { ...p, isReady } : p
        )
        return {
          ...prev,
          roomState: { ...prev.roomState, players: updatedPlayers },
        }
      })
    },
    [peer, sendMessage]
  )

  /**
   * Starts the game (host only). Broadcasts game_start message to all players.
   */
  const startGame = useCallback(() => {
    if (gameState.myRole !== 'host') return

    const message: MultiplayerMessage = {
      type: 'game_start',
      timestamp: Date.now(),
      payload: {
        gameCells: [], // Not used currently, but kept for protocol compatibility
      },
    }
    sendMessage(message)

    // Update local state for host
    setGameState((prev) => ({
      ...prev,
      phase: 'character_selection',
      roomState: prev.roomState ? { ...prev.roomState, gameStarted: true } : null,
    }))
  }, [gameState.myRole, sendMessage])

  /**
   * Selects a secret character (does not reveal to opponent).
   */
  const selectSecretCharacter = useCallback(
    (character: Character) => {
      setGameState((prev) => {
        // Initialize markers array based on character count
        const characterCount = prev.roomState?.selectedCharacters.length ?? 0
        const emptyMarkers: CellMarkers[] = Array(characterCount).fill(null).map(() => ({ x: false, o: false }))

        return {
          ...prev,
          mySecretCharacter: character,
          phase: 'playing',
          myMarkers: emptyMarkers,
          opponentMarkers: emptyMarkers.map(() => ({ x: false, o: false })),
        }
      })

      // Notify opponent that we've selected (without revealing which one)
      const message: MultiplayerMessage = {
        type: 'character_selected',
        timestamp: Date.now(),
        payload: { playerId: peer.peerId ?? '' },
      }
      sendMessage(message)
    },
    [peer, sendMessage]
  )

  /**
   * Toggles a marker on a cell and syncs with opponent.
   */
  const toggleCellMarker = useCallback(
    (cellIndex: number) => {
      // Can only edit in 'my' view
      if (gameState.currentView !== 'my') return

      setGameState((prev) => {
        const newMarkers = [...prev.myMarkers]
        const currentMarkers = newMarkers[cellIndex] ?? { x: false, o: false }

        // Toggle the active marker
        const updatedMarkers: CellMarkers = {
          ...currentMarkers,
          [activeMarker]: !currentMarkers[activeMarker],
        }

        newMarkers[cellIndex] = updatedMarkers

        // Send update to opponent
        const message: MultiplayerMessage = {
          type: 'marker_update',
          timestamp: Date.now(),
          payload: {
            playerId: peer.peerId ?? '',
            cellIndex,
            markers: updatedMarkers,
          },
        }
        sendMessage(message)

        return {
          ...prev,
          myMarkers: newMarkers,
        }
      })
    },
    [activeMarker, gameState.currentView, peer.peerId, sendMessage]
  )

  /**
   * Sets the current view mode.
   */
  const setCurrentView = useCallback((view: MarkerView) => {
    setGameState((prev) => ({ ...prev, currentView: view }))
  }, [])

  /**
   * Sets the active marker type.
   */
  const setActiveMarker = useCallback((marker: MarkerType) => {
    setActiveMarkerState(marker)
  }, [])

  /**
   * Submits the final guess.
   * Handles both initial guess and counter-guess scenarios.
   */
  const submitFinalGuess = useCallback(
    (character: Character) => {
      const myPeerId = peer.peerId ?? ''

      setGameState((prev) => {
        const isCounterGuess = prev.mustCounterGuess

        // Send the guess to opponent, including our secret for result calculation
        const guessMessage: MultiplayerMessage = {
          type: 'final_guess',
          timestamp: Date.now(),
          payload: {
            playerId: myPeerId,
            guessedCharacterId: character.id,
            mySecretCharacterId: prev.mySecretCharacter?.id ?? '',
          },
        }
        sendMessage(guessMessage)

        // Note: For counter-guess scenarios, the receiver of our final_guess
        // will calculate and send game_result. We just wait for the result.

        return {
          ...prev,
          myFinalGuess: character,
          phase: 'waiting_for_result',
          initiatorId: isCounterGuess ? prev.initiatorId : myPeerId,
        }
      })
    },
    [peer.peerId, sendMessage]
  )

  /**
   * Sends game result after receiving opponent's guess.
   */
  const sendGameResult = useCallback(
    (winnerId: string | null, initiatorGuessCorrect: boolean, counterGuessCorrect?: boolean) => {
      // Use opponentSecretCharacter (revealed via final_guess message) for accurate result
      const hostSecretId = gameState.myRole === 'host'
        ? gameState.mySecretCharacter?.id ?? ''
        : gameState.opponentSecretCharacter?.id ?? ''
      const guestSecretId = gameState.myRole === 'guest'
        ? gameState.mySecretCharacter?.id ?? ''
        : gameState.opponentSecretCharacter?.id ?? ''

      const resultMessage: MultiplayerMessage = {
        type: 'game_result',
        timestamp: Date.now(),
        payload: {
          winnerId,
          hostSecretCharacterId: hostSecretId,
          guestSecretCharacterId: guestSecretId,
          initiatorId: gameState.initiatorId ?? '',
          initiatorGuessCorrect,
          counterGuessCorrect,
        },
      }
      sendMessage(resultMessage)

      // Update local state
      setGameState((prev) => ({
        ...prev,
        phase: 'finished',
        gameResult: {
          winnerId,
          hostSecretCharacterId: hostSecretId,
          guestSecretCharacterId: guestSecretId,
          initiatorId: gameState.initiatorId ?? '',
          initiatorGuessCorrect,
          counterGuessCorrect,
        },
      }))
    },
    [gameState.myRole, gameState.mySecretCharacter, gameState.opponentSecretCharacter, gameState.initiatorId, sendMessage]
  )

  /**
   * Requests a rematch.
   */
  const requestRematch = useCallback(() => {
    const message: MultiplayerMessage = {
      type: 'rematch',
      timestamp: Date.now(),
      payload: { playerId: peer.peerId ?? '' },
    }
    sendMessage(message)

    // Reset local state for new game
    setGameState((prev) => ({
      ...prev,
      phase: 'character_selection',
      mySecretCharacter: null,
      opponentHasSelectedCharacter: false,
      myFinalGuess: null,
      opponentFinalGuess: null,
      opponentSecretCharacter: null,
      gameResult: null,
      myMarkers: [],
      opponentMarkers: [],
      currentView: 'my',
      mustCounterGuess: false,
      initiatorId: null,
    }))
  }, [peer.peerId, sendMessage])

  /**
   * Requests return to lobby.
   */
  const requestReturnToLobby = useCallback(() => {
    const message: MultiplayerMessage = {
      type: 'return_lobby',
      timestamp: Date.now(),
      payload: { playerId: peer.peerId ?? '' },
    }
    sendMessage(message)

    // Reset local state to lobby
    setGameState((prev) => ({
      ...prev,
      phase: 'lobby',
      mySecretCharacter: null,
      opponentHasSelectedCharacter: false,
      myFinalGuess: null,
      opponentFinalGuess: null,
      opponentSecretCharacter: null,
      gameResult: null,
      myMarkers: [],
      opponentMarkers: [],
      currentView: 'my',
      mustCounterGuess: false,
      initiatorId: null,
      roomState: prev.roomState ? {
        ...prev.roomState,
        gameStarted: false,
        players: prev.roomState.players.map(p => ({ ...p, isReady: false })),
      } : null,
    }))
  }, [peer.peerId, sendMessage])

  // Effect to handle judgment when opponent's guess is received
  // This runs when we receive a final_guess and need to determine the result
  useEffect(() => {
    // Only process if we received opponent's guess and we have our secret
    if (!gameState.opponentFinalGuess || !gameState.mySecretCharacter) return
    // Don't process if game is already finished
    if (gameState.phase === 'finished') return

    const myPeerId = peer.peerId ?? ''
    const iAmInitiator = gameState.initiatorId === myPeerId

    // Don't process if we're the counter-guesser waiting for result
    // (initiator should still process to determine the result)
    if (gameState.phase === 'waiting_for_result' && !gameState.mustCounterGuess && !iAmInitiator) return

    const opponentGuessedCorrectly = gameState.opponentFinalGuess.id === gameState.mySecretCharacter.id

    // If opponent was the initiator and hasn't received our counter-guess yet
    if (gameState.mustCounterGuess) {
      // We need to counter-guess, don't determine result yet
      // Notify opponent that we must counter-guess
      const counterGuessRequiredMsg: MultiplayerMessage = {
        type: 'counter_guess_required',
        timestamp: Date.now(),
        payload: {
          initiatorGuessedCharacterId: gameState.opponentFinalGuess.id,
          initiatorId: gameState.initiatorId ?? '',
        },
      }
      sendMessage(counterGuessRequiredMsg)
      return
    }

    // If we were the initiator (we guessed first)
    if (gameState.initiatorId === myPeerId) {
      // This is opponent's counter-guess response
      // We already know our guess was correct (that's why they're counter-guessing)
      // Now check if their counter-guess is correct
      const counterGuessCorrect = opponentGuessedCorrectly
      const initiatorCorrect = true // We know this because we're at counter-guess stage

      // Determine winner
      let winnerId: string | null
      if (counterGuessCorrect) {
        winnerId = null // Draw
      } else {
        winnerId = myPeerId // We win
      }

      // Schedule sendGameResult to avoid setState during render
      setTimeout(() => {
        sendGameResult(winnerId, initiatorCorrect, counterGuessCorrect)
      }, 0)
      return
    }

    // If opponent was the initiator and guessed wrong
    if (!opponentGuessedCorrectly && !gameState.mustCounterGuess && gameState.initiatorId !== myPeerId) {
      // Opponent guessed wrong - we win
      // Schedule sendGameResult to avoid setState during render
      setTimeout(() => {
        sendGameResult(myPeerId, false, undefined)
      }, 0)
    }
  }, [
    gameState.opponentFinalGuess,
    gameState.mySecretCharacter,
    gameState.phase,
    gameState.mustCounterGuess,
    gameState.initiatorId,
    gameState.myFinalGuess,
    gameState.myRole,
    gameState.roomState?.selectedCharacters,
    peer.peerId,
    sendMessage,
    sendGameResult,
  ])

  // Computed values
  const isHost = gameState.myRole === 'host'
  const isConnected = connectionStatus === 'connected'
  const opponentPlayer =
    gameState.roomState?.players.find((p) => p.role !== gameState.myRole) ?? null

  return (
    <MultiplayerContext.Provider
      value={{
        connectionStatus,
        peerId: peer.peerId,
        error: gameState.error,
        roomState: gameState.roomState,
        myRole: gameState.myRole,
        gamePhase: gameState.phase,
        mySecretCharacter: gameState.mySecretCharacter,
        opponentHasSelectedCharacter: gameState.opponentHasSelectedCharacter,
        myFinalGuess: gameState.myFinalGuess,
        opponentFinalGuess: gameState.opponentFinalGuess,
        gameResult: gameState.gameResult,
        mustCounterGuess: gameState.mustCounterGuess,
        myMarkers: gameState.myMarkers,
        opponentMarkers: gameState.opponentMarkers,
        currentView: gameState.currentView,
        activeMarker,
        createRoom,
        joinRoom,
        leaveRoom,
        setReady,
        startGame,
        selectSecretCharacter,
        toggleCellMarker,
        setCurrentView,
        setActiveMarker,
        submitFinalGuess,
        requestRematch,
        requestReturnToLobby,
        isHost,
        isConnected,
        opponentPlayer,
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  )
}

/**
 * Hook to access multiplayer context.
 * Must be used within a MultiplayerProvider.
 */
export function useMultiplayer() {
  const context = useContext(MultiplayerContext)
  if (!context) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider')
  }
  return context
}
