import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/contexts/AppContext'
import { useMultiplayer } from '@/contexts/MultiplayerContext'
import { getCharacterImageUrl } from '@/lib/theme-loader'
import type { Character } from '@/types'
import { cn } from '@/lib/utils'
import { Check, Clock, User } from 'lucide-react'

export function SecretSelectionPage() {
  const { selectedTheme, setScreen } = useApp()
  const {
    roomState,
    mySecretCharacter,
    opponentHasSelectedCharacter,
    selectSecretCharacter,
    gamePhase,
    peerId,
    error,
  } = useMultiplayer()

  // Use context value directly instead of local state when already confirmed
  const [localSelectedCharacter, setLocalSelectedCharacter] = useState<Character | null>(null)
  const [localIsConfirmed, setLocalIsConfirmed] = useState(false)

  // Derive state: if context has mySecretCharacter, use that
  const selectedCharacter = mySecretCharacter ?? localSelectedCharacter
  const isConfirmed = mySecretCharacter !== null || localIsConfirmed

  const characters = roomState?.selectedCharacters ?? []
  const gridSize = roomState?.gridSize ?? 4

  // Navigate to game when gamePhase changes to 'playing'
  // This is the single source of truth for navigation
  useEffect(() => {
    if (gamePhase === 'playing') {
      setScreen('game')
    }
  }, [gamePhase, setScreen])

  const handleSelectCharacter = (character: Character) => {
    if (isConfirmed) return // Can't change after confirming
    setLocalSelectedCharacter(character)
  }

  const handleConfirm = () => {
    if (!selectedCharacter || isConfirmed) return
    setLocalIsConfirmed(true)
    selectSecretCharacter(selectedCharacter)
  }

  // Get player info
  const myPlayer = roomState?.players.find((p) => p.id === peerId)
  const opponentPlayer = roomState?.players.find((p) => p.id !== peerId)
  const isHost = myPlayer?.role === 'host'

  if (!selectedTheme || characters.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        {error ? (
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => setScreen('home')}>返回首页</Button>
          </div>
        ) : (
          <p className="text-muted-foreground">加载中...</p>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">选择你的秘密角色</h1>
          <p className="text-muted-foreground">
            选择一个角色作为你的秘密身份，对方需要猜出你是谁
          </p>
        </div>

        {/* Player Status Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* My Status */}
          <Card className={cn(isConfirmed && 'border-green-500/50')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                你 {isHost && '(房主)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isConfirmed ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="text-sm font-medium">已选择</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">选择中...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Opponent Status */}
          <Card className={cn(opponentHasSelectedCharacter && 'border-green-500/50')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                {opponentPlayer?.role === 'host' ? '房主' : '对手'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {opponentHasSelectedCharacter ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="text-sm font-medium">已选择</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 animate-pulse" />
                  <span className="text-sm">选择中...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        {!isConfirmed && (
          <div className="text-center mb-4">
            <p className="text-lg font-medium">
              {selectedCharacter
                ? `已选择: ${selectedCharacter.name}`
                : '点击选择一个角色'}
            </p>
          </div>
        )}

        {/* Character Grid */}
        <div
          className="grid gap-2 sm:gap-3 mb-6"
          style={{
            gridTemplateColumns: `repeat(${Math.min(gridSize, 6)}, minmax(0, 1fr))`,
          }}
        >
          {characters.map((character) => {
            const isSelected = selectedCharacter?.id === character.id

            return (
              <button
                key={character.id}
                type="button"
                onClick={() => handleSelectCharacter(character)}
                disabled={isConfirmed}
                className={cn(
                  'relative flex flex-col items-center p-1.5 sm:p-2 rounded-lg border-2 transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  isSelected
                    ? 'border-primary bg-primary/10 ring-2 ring-primary'
                    : 'border-transparent bg-muted/50 hover:bg-muted',
                  isConfirmed && !isSelected && 'opacity-40',
                  isConfirmed && 'cursor-default'
                )}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}

                {/* Character Image */}
                <img
                  src={getCharacterImageUrl(selectedTheme, character)}
                  alt={character.name}
                  loading="lazy"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover bg-muted"
                />

                {/* Character Name */}
                <span className="mt-1 text-xs text-center truncate w-full">
                  {character.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Confirm Button */}
        <div className="flex justify-center">
          {isConfirmed ? (
            <div className="text-center">
              <p className="text-green-600 font-medium mb-2">
                ✓ 已确认选择: {selectedCharacter?.name}
              </p>
              {!opponentHasSelectedCharacter && (
                <p className="text-muted-foreground text-sm animate-pulse">
                  等待对方选择...
                </p>
              )}
            </div>
          ) : (
            <Button
              size="lg"
              disabled={!selectedCharacter}
              onClick={handleConfirm}
              className="min-w-[200px]"
            >
              确认选择
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
