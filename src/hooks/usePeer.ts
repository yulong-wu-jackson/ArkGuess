import { useState, useEffect, useCallback, useRef } from 'react'
import type { DataConnection } from 'peerjs'
import {
  PeerService,
  createPeerService,
  type PeerServiceConfig,
  type PeerServiceEvents,
} from '@/lib/peer-service'
import type { MultiplayerMessage, ConnectionStatus } from '@/types/multiplayer'

/**
 * Return type for the usePeer hook.
 */
export interface UsePeerReturn {
  /** Current peer ID (null if not initialized) */
  peerId: string | null
  /** Connection status */
  status: ConnectionStatus
  /** Error message if any */
  error: string | null
  /** List of connected peer IDs */
  connectedPeers: string[]
  /** Initialize the peer with optional config */
  initialize: (config?: PeerServiceConfig) => Promise<string>
  /** Connect to a remote peer */
  connect: (remotePeerId: string) => Promise<DataConnection>
  /** Send data to a specific peer */
  send: (peerId: string, data: MultiplayerMessage) => boolean
  /** Broadcast data to all connected peers */
  broadcast: (data: MultiplayerMessage) => void
  /** Disconnect from a specific peer */
  disconnect: (peerId: string) => void
  /** Destroy the peer instance */
  destroy: () => void
  /** Check if ready */
  isReady: boolean
}

/**
 * Options for the usePeer hook.
 */
export interface UsePeerOptions {
  /** Called when data is received from any peer */
  onData?: (data: MultiplayerMessage, connection: DataConnection) => void
  /** Called when a new connection is established (incoming) */
  onConnection?: (connection: DataConnection) => void
  /** Called when a connection is closed */
  onConnectionClose?: (connection: DataConnection) => void
  /** Called when an error occurs */
  onError?: (error: Error) => void
}

/**
 * React hook for managing PeerJS connections.
 * Handles lifecycle management and provides a clean API for P2P communication.
 *
 * @param options - Event handlers for peer events
 * @returns Object with peer state and control methods
 *
 * @example
 * ```tsx
 * const { peerId, status, initialize, connect, send, destroy } = usePeer({
 *   onData: (data) => console.log('Received:', data),
 *   onConnection: (conn) => console.log('New connection:', conn.peer),
 * })
 *
 * // Initialize as host
 * await initialize({ peerId: 'room-abc123' })
 *
 * // Or connect to a room
 * await connect('room-abc123')
 *
 * // Send a message
 * send('peer-id', { type: 'room_info', timestamp: Date.now(), payload: {...} })
 * ```
 */
export function usePeer(options: UsePeerOptions = {}): UsePeerReturn {
  const [peerId, setPeerId] = useState<string | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [error, setError] = useState<string | null>(null)
  const [connectedPeers, setConnectedPeers] = useState<string[]>([])
  const [isReady, setIsReady] = useState(false)

  const serviceRef = useRef<PeerService | null>(null)
  const optionsRef = useRef(options)

  // Keep options ref up to date
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      serviceRef.current?.destroy()
      serviceRef.current = null
    }
  }, [])

  const updateConnectedPeers = useCallback(() => {
    if (serviceRef.current) {
      setConnectedPeers(serviceRef.current.getConnectedPeers())
    }
  }, [])

  const initialize = useCallback(async (config: PeerServiceConfig = {}): Promise<string> => {
    // Destroy existing service if any
    if (serviceRef.current) {
      serviceRef.current.destroy()
    }

    setStatus('connecting')
    setError(null)

    const service = createPeerService()
    serviceRef.current = service

    const events: PeerServiceEvents = {
      onOpen: (id) => {
        setPeerId(id)
        setStatus('connected')
        setIsReady(true)
      },
      onClose: () => {
        setStatus('disconnected')
        setPeerId(null)
        setConnectedPeers([])
        setIsReady(false)
      },
      onError: (err) => {
        setError(err.message)
        setStatus('error')
        optionsRef.current.onError?.(err)
      },
      onConnection: (conn) => {
        updateConnectedPeers()
        optionsRef.current.onConnection?.(conn)
      },
      onData: (data, conn) => {
        optionsRef.current.onData?.(data, conn)
      },
      onConnectionClose: (conn) => {
        updateConnectedPeers()
        optionsRef.current.onConnectionClose?.(conn)
      },
    }

    try {
      const id = await service.initialize(config, events)
      return id
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '连接失败'
      setError(errorMessage)
      setStatus('error')
      throw err
    }
  }, [updateConnectedPeers])

  const connect = useCallback(async (remotePeerId: string): Promise<DataConnection> => {
    if (!serviceRef.current) {
      throw new Error('Peer not initialized')
    }

    try {
      const conn = await serviceRef.current.connect(remotePeerId)
      updateConnectedPeers()
      return conn
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '连接失败'
      setError(errorMessage)
      throw err
    }
  }, [updateConnectedPeers])

  const send = useCallback((targetPeerId: string, data: MultiplayerMessage): boolean => {
    if (!serviceRef.current) {
      return false
    }
    return serviceRef.current.send(targetPeerId, data)
  }, [])

  const broadcast = useCallback((data: MultiplayerMessage): void => {
    serviceRef.current?.broadcast(data)
  }, [])

  const disconnect = useCallback((targetPeerId: string): void => {
    serviceRef.current?.disconnect(targetPeerId)
    updateConnectedPeers()
  }, [updateConnectedPeers])

  const destroy = useCallback((): void => {
    serviceRef.current?.destroy()
    serviceRef.current = null
    setPeerId(null)
    setStatus('disconnected')
    setError(null)
    setConnectedPeers([])
    setIsReady(false)
  }, [])

  return {
    peerId,
    status,
    error,
    connectedPeers,
    initialize,
    connect,
    send,
    broadcast,
    disconnect,
    destroy,
    isReady,
  }
}
