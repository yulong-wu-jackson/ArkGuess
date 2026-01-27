import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/contexts/AppContext'
import { useMultiplayer } from '@/contexts/MultiplayerContext'
import { Copy, Check, Users, Grid3X3, Shuffle, Crown, User, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LobbyPage() {
  const { selectedTheme, gridSize, gameMode, setScreen } = useApp()
  const {
    roomState,
    leaveRoom,
    setReady,
    isHost,
    peerId,
    error,
    gamePhase,
  } = useMultiplayer()

  const [copied, setCopied] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const roomCode = roomState?.roomCode ?? ''
  const players = roomState?.players ?? []
  const myPlayer = players.find((p) => p.id === peerId)
  const myIsReady = myPlayer?.isReady ?? false

  const allPlayersReady = players.length === 2 && players.every((p) => p.isReady)
  const prevAllReadyRef = useRef(false)

  // Handle countdown when both players are ready
  useEffect(() => {
    // Only start countdown when transitioning to all ready state
    if (allPlayersReady && !prevAllReadyRef.current) {
      prevAllReadyRef.current = true
      let count = 3

      // Use setTimeout with 0 delay to schedule state update after effect completes
      const initialTimeout = setTimeout(() => {
        setCountdown(count)
      }, 0)

      countdownRef.current = setInterval(() => {
        count -= 1
        if (count <= 0) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current)
            countdownRef.current = null
          }
          setCountdown(0)
        } else {
          setCountdown(count)
        }
      }, 1000)

      return () => {
        clearTimeout(initialTimeout)
        if (countdownRef.current) {
          clearInterval(countdownRef.current)
          countdownRef.current = null
        }
      }
    } else if (!allPlayersReady && prevAllReadyRef.current) {
      // Cancel countdown when someone unreadies
      prevAllReadyRef.current = false
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
        countdownRef.current = null
      }
      // Schedule state update after effect completes
      const cancelTimeout = setTimeout(() => {
        setCountdown(null)
      }, 0)
      return () => clearTimeout(cancelTimeout)
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
        countdownRef.current = null
      }
    }
  }, [allPlayersReady])

  // Navigate to character selection when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      // Clear interval before navigation to prevent memory leak
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
        countdownRef.current = null
      }
      setScreen('character-select')
    }
  }, [countdown, setScreen])

  // Navigate to character selection if game phase changes
  useEffect(() => {
    if (gamePhase === 'character_selection') {
      setScreen('character-select')
    }
  }, [gamePhase, setScreen])

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('房间码: ' + roomCode)
    }
  }

  const handleToggleReady = () => {
    setReady(!myIsReady)
  }

  const handleLeave = () => {
    leaveRoom()
    setScreen('home')
  }

  // Resolve theme and mode from context or roomState
  const themeName = selectedTheme?.manifest.name ?? '明日方舟'
  const displayGridSize = roomState?.gridSize ?? gridSize
  const displayMode = gameMode ?? 'random'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">游戏大厅</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl font-mono">{roomCode}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCopyCode}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Countdown Overlay */}
        {countdown !== null && countdown > 0 && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">游戏即将开始</p>
              <span className="text-8xl font-bold text-primary animate-pulse">
                {countdown}
              </span>
            </div>
          </div>
        )}

        {/* Game Settings */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">游戏设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <Grid3X3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">主题:</span>
              <span className="font-medium">{themeName}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="h-4 w-4 text-muted-foreground text-center font-bold">
                {displayGridSize}
              </span>
              <span className="text-muted-foreground">网格:</span>
              <span className="font-medium">
                {displayGridSize} × {displayGridSize}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shuffle className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">模式:</span>
              <span className="font-medium">
                {displayMode === 'random' ? '随机模式' : '自选模式'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Players */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              玩家 ({players.length}/2)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Host Player */}
            {players.filter((p) => p.role === 'host').map((player) => (
              <div
                key={player.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border',
                  player.id === peerId ? 'bg-primary/5 border-primary/20' : ''
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Crown className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium">
                      房主 {player.id === peerId && '（你）'}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    'text-sm font-medium',
                    player.isReady ? 'text-green-500' : 'text-muted-foreground'
                  )}
                >
                  {player.isReady ? '已准备' : '未准备'}
                </span>
              </div>
            ))}

            {/* Guest Player */}
            {players.filter((p) => p.role === 'guest').map((player) => (
              <div
                key={player.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border',
                  player.id === peerId ? 'bg-primary/5 border-primary/20' : ''
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">
                      玩家 {player.id === peerId && '（你）'}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    'text-sm font-medium',
                    player.isReady ? 'text-green-500' : 'text-muted-foreground'
                  )}
                >
                  {player.isReady ? '已准备' : '未准备'}
                </span>
              </div>
            ))}

            {/* Waiting for player */}
            {players.length < 2 && (
              <div className="flex items-center justify-between p-3 rounded-lg border border-dashed">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">等待玩家加入...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error display */}
        {error && (
          <div className="p-4 mb-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-destructive text-sm text-center">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {players.length === 2 && (
            <Button
              size="lg"
              className={cn(
                'w-full',
                myIsReady && 'bg-green-600 hover:bg-green-700'
              )}
              onClick={handleToggleReady}
              disabled={countdown !== null && countdown > 0}
            >
              {myIsReady ? '取消准备' : '我准备好了'}
            </Button>
          )}

          {players.length < 2 && isHost && (
            <p className="text-center text-muted-foreground text-sm">
              等待另一位玩家加入后即可准备
            </p>
          )}

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleLeave}
            disabled={countdown !== null && countdown > 0}
          >
            <LogOut className="mr-2 h-4 w-4" />
            离开房间
          </Button>
        </div>
      </div>
    </div>
  )
}
