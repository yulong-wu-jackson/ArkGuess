import Peer from 'peerjs'
import type { DataConnection } from 'peerjs'
import type { MultiplayerMessage } from '@/types/multiplayer'

/**
 * Event handlers for PeerService.
 */
export interface PeerServiceEvents {
  onOpen?: (peerId: string) => void
  onClose?: () => void
  onError?: (error: Error) => void
  onConnection?: (connection: DataConnection) => void
  onData?: (data: MultiplayerMessage, connection: DataConnection) => void
  onConnectionClose?: (connection: DataConnection) => void
}

/**
 * Configuration for PeerService.
 */
export interface PeerServiceConfig {
  peerId?: string
  debug?: 0 | 1 | 2 | 3
}

/**
 * Generates a random 6-character room code in format ABC-123.
 * Uses uppercase letters and numbers, excluding easily confused characters.
 * Excluded: I, L, O (letters) and 0, 1 (numbers) to prevent confusion.
 */
export function generateRoomCode(): string {
  const letters = 'ABCDEFGHJKMNPQRSTUVWXYZ' // Excludes I, L, O
  const numbers = '23456789' // Excludes 0, 1

  const letterPart = Array.from({ length: 3 }, () =>
    letters[Math.floor(Math.random() * letters.length)]
  ).join('')

  const numberPart = Array.from({ length: 3 }, () =>
    numbers[Math.floor(Math.random() * numbers.length)]
  ).join('')

  return `${letterPart}-${numberPart}`
}

/**
 * Formats a room code for use as a PeerJS peer ID.
 * Adds a prefix to avoid conflicts.
 */
export function roomCodeToPeerId(roomCode: string): string {
  return `arkguess-${roomCode.replace('-', '').toLowerCase()}`
}

/**
 * Extracts room code from a peer ID.
 */
export function peerIdToRoomCode(peerId: string): string | null {
  const match = peerId.match(/^arkguess-([a-z]{3})(\d{3})$/)
  if (!match) return null
  return `${match[1].toUpperCase()}-${match[2]}`
}

/**
 * PeerJS wrapper service for managing P2P connections.
 * Handles connection lifecycle, data transmission, and event management.
 */
export class PeerService {
  private peer: Peer | null = null
  private connections: Map<string, DataConnection> = new Map()
  private events: PeerServiceEvents = {}
  private isDestroyed = false

  /**
   * Initializes the Peer instance with the given configuration.
   * @param config - Configuration options for the peer
   * @param events - Event handlers for peer events
   */
  async initialize(config: PeerServiceConfig = {}, events: PeerServiceEvents = {}): Promise<string> {
    this.events = events
    this.isDestroyed = false

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer(config.peerId ?? '', {
          debug: config.debug ?? 0,
        })

        this.peer.on('open', (id) => {
          this.events.onOpen?.(id)
          resolve(id)
        })

        this.peer.on('error', (err) => {
          const error = err instanceof Error ? err : new Error(String(err))
          this.events.onError?.(error)
          if (!this.peer?.id) {
            reject(error)
          }
        })

        this.peer.on('close', () => {
          this.events.onClose?.()
        })

        this.peer.on('connection', (conn) => {
          this.handleConnection(conn)
          this.events.onConnection?.(conn)
        })

        this.peer.on('disconnected', () => {
          // Attempt to reconnect if not destroyed
          if (!this.isDestroyed && this.peer) {
            this.peer.reconnect()
          }
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * Sets up event handlers for a connection.
   */
  private handleConnection(conn: DataConnection): void {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn)
    })

    conn.on('data', (data) => {
      this.events.onData?.(data as MultiplayerMessage, conn)
    })

    conn.on('close', () => {
      this.connections.delete(conn.peer)
      this.events.onConnectionClose?.(conn)
    })

    conn.on('error', (err) => {
      const error = err instanceof Error ? err : new Error(String(err))
      this.events.onError?.(error)
    })
  }

  /**
   * Connects to a remote peer.
   * @param remotePeerId - The peer ID to connect to
   * @returns The established connection
   */
  connect(remotePeerId: string): Promise<DataConnection> {
    return new Promise((resolve, reject) => {
      if (!this.peer) {
        reject(new Error('Peer not initialized'))
        return
      }

      const conn = this.peer.connect(remotePeerId, {
        reliable: true,
      })

      conn.on('open', () => {
        this.connections.set(conn.peer, conn)
        this.handleConnection(conn)
        resolve(conn)
      })

      conn.on('error', (err) => {
        const error = err instanceof Error ? err : new Error(String(err))
        reject(error)
      })

      // Timeout for connection
      setTimeout(() => {
        if (!conn.open) {
          reject(new Error('连接超时'))
        }
      }, 10000)
    })
  }

  /**
   * Sends data to a specific peer.
   * @param peerId - The peer ID to send to
   * @param data - The message to send
   */
  send(peerId: string, data: MultiplayerMessage): boolean {
    const conn = this.connections.get(peerId)
    if (!conn || !conn.open) {
      return false
    }
    conn.send(data)
    return true
  }

  /**
   * Broadcasts data to all connected peers.
   * @param data - The message to broadcast
   */
  broadcast(data: MultiplayerMessage): void {
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(data)
      }
    })
  }

  /**
   * Gets the current peer ID.
   */
  getPeerId(): string | null {
    return this.peer?.id ?? null
  }

  /**
   * Gets all connected peer IDs.
   */
  getConnectedPeers(): string[] {
    return Array.from(this.connections.keys())
  }

  /**
   * Checks if connected to a specific peer.
   */
  isConnectedTo(peerId: string): boolean {
    const conn = this.connections.get(peerId)
    return conn?.open ?? false
  }

  /**
   * Disconnects from a specific peer.
   */
  disconnect(peerId: string): void {
    const conn = this.connections.get(peerId)
    if (conn) {
      conn.close()
      this.connections.delete(peerId)
    }
  }

  /**
   * Destroys the peer instance and closes all connections.
   */
  destroy(): void {
    this.isDestroyed = true
    this.connections.forEach((conn) => conn.close())
    this.connections.clear()
    this.peer?.destroy()
    this.peer = null
  }

  /**
   * Checks if the peer is initialized and connected to the signaling server.
   */
  isReady(): boolean {
    return this.peer !== null && !this.peer.destroyed && this.peer.open
  }
}

/**
 * Creates a new PeerService instance.
 * This is the recommended way to instantiate the service.
 */
export function createPeerService(): PeerService {
  return new PeerService()
}
