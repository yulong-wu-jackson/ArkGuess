import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/contexts/AppContext'
import { useMultiplayer } from '@/contexts/MultiplayerContext'
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react'

export function JoinRoomPage() {
  const { setScreen } = useApp()
  const { joinRoom, connectionStatus } = useMultiplayer()
  const [roomCode, setRoomCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValidCode = /^[A-Za-z]{3}-?[0-9]{3}$/.test(roomCode.replace(/\s/g, ''))
  const isConnecting = connectionStatus === 'connecting' || isJoining

  const formatRoomCode = (value: string): string => {
    // Remove all non-alphanumeric characters and convert to uppercase
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '')

    // Insert dash after 3 characters
    if (cleaned.length > 3) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}`
    }
    return cleaned
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRoomCode(e.target.value)
    setRoomCode(formatted)
    setError(null)
  }

  const handleJoin = async () => {
    if (!isValidCode) {
      setError('请输入有效的房间码（格式：ABC-123）')
      return
    }

    setIsJoining(true)
    setError(null)

    try {
      await joinRoom(roomCode)
      setScreen('lobby')
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('Could not connect to peer') || err.message.includes('连接超时')) {
          setError('找不到该房间，请检查房间码是否正确')
        } else {
          setError(err.message)
        }
      } else {
        setError('加入房间失败')
      }
    } finally {
      setIsJoining(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidCode && !isConnecting) {
      handleJoin()
    }
  }

  const handleBack = () => {
    setScreen('home')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={handleBack} disabled={isConnecting}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">加入房间</h1>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <UserPlus className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle>输入房间码</CardTitle>
            <CardDescription>
              向房主获取 6 位房间码
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="ABC-123"
                value={roomCode}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isConnecting}
                className="text-center text-2xl font-mono tracking-wider h-14"
                maxLength={7}
                autoFocus
              />
              {error && (
                <p className="text-destructive text-sm text-center">{error}</p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                disabled={!isValidCode || isConnecting}
                onClick={handleJoin}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    连接中...
                  </>
                ) : (
                  '加入房间'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isConnecting}
                className="w-full"
              >
                返回
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
