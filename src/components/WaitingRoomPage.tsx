import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/contexts/AppContext'
import { useMultiplayer } from '@/contexts/MultiplayerContext'
import { Copy, Check, Users, Grid3X3, Shuffle } from 'lucide-react'

export function WaitingRoomPage() {
  const { selectedTheme, gridSize, gameMode, setScreen } = useApp()
  const { roomState, leaveRoom, opponentPlayer, connectionStatus, error } = useMultiplayer()
  const [copied, setCopied] = useState(false)

  const roomCode = roomState?.roomCode ?? ''
  const hasOpponent = opponentPlayer !== null

  // Navigate to lobby when opponent joins
  useEffect(() => {
    if (hasOpponent) {
      setScreen('lobby')
    }
  }, [hasOpponent, setScreen])

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = roomCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCancel = () => {
    leaveRoom()
    setScreen('home')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">等待玩家加入</h1>
          <p className="text-muted-foreground">
            分享房间码给你的对手
          </p>
        </div>

        {/* Room Code Display */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardDescription className="text-center">房间码</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl sm:text-5xl font-mono font-bold tracking-wider">
                {roomCode}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyCode}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Game Settings Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">游戏设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Grid3X3 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">主题</p>
                <p className="font-medium">{selectedTheme?.manifest.name ?? '未选择'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{gridSize}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">网格大小</p>
                <p className="font-medium">{gridSize} × {gridSize} ({gridSize * gridSize} 个角色)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Shuffle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">模式</p>
                <p className="font-medium">{gameMode === 'random' ? '随机模式' : '自选模式'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Player Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              玩家状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>你（房主）</span>
                <span className="text-green-500 text-sm">已就绪</span>
              </div>
              <div className="flex items-center justify-between">
                <span>对手</span>
                {hasOpponent ? (
                  <span className="text-green-500 text-sm">已加入</span>
                ) : (
                  <span className="text-muted-foreground text-sm animate-pulse">
                    等待加入中...
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Status */}
        {connectionStatus === 'error' && (
          <div className="p-4 mb-6 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-destructive text-sm text-center">
              {error || '连接出现问题，请尝试重新创建房间'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
        </div>
      </div>
    </div>
  )
}
