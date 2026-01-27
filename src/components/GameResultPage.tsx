import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/contexts/AppContext'
import { useMultiplayer } from '@/contexts/MultiplayerContext'
import { getCharacterImageUrl } from '@/lib/theme-loader'
import { cn } from '@/lib/utils'
import { Trophy, Frown, Handshake, RotateCcw, Home, Check, X } from 'lucide-react'

export function GameResultPage() {
  const { selectedTheme, setScreen } = useApp()
  const {
    gameResult,
    mySecretCharacter,
    myFinalGuess,
    opponentFinalGuess,
    roomState,
    peerId,
    myRole,
    requestRematch,
    requestReturnToLobby,
  } = useMultiplayer()

  if (!gameResult || !selectedTheme) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  // Determine winner status
  const isWinner = gameResult.winnerId === peerId
  const isDraw = gameResult.winnerId === null
  const isLoser = !isWinner && !isDraw

  // Get characters from IDs
  const characters = roomState?.selectedCharacters ?? []
  const mySecret = mySecretCharacter
  const opponentSecret = characters.find(
    c => c.id === (myRole === 'host' ? gameResult.guestSecretCharacterId : gameResult.hostSecretCharacterId)
  )

  // Determine who initiated
  const iWasInitiator = gameResult.initiatorId === peerId

  const handleRematch = () => {
    requestRematch()
    setScreen('character-select')
  }

  const handleReturnToLobby = () => {
    requestReturnToLobby()
    setScreen('lobby')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Result Banner */}
        <div
          className={cn(
            'text-center mb-8 p-6 rounded-xl',
            isWinner && 'bg-green-500/10 border border-green-500/20',
            isDraw && 'bg-yellow-500/10 border border-yellow-500/20',
            isLoser && 'bg-red-500/10 border border-red-500/20'
          )}
        >
          <div className="flex justify-center mb-4">
            {isWinner && <Trophy className="h-16 w-16 text-green-500" />}
            {isDraw && <Handshake className="h-16 w-16 text-yellow-500" />}
            {isLoser && <Frown className="h-16 w-16 text-red-500" />}
          </div>
          <h1
            className={cn(
              'text-4xl font-bold mb-2',
              isWinner && 'text-green-600',
              isDraw && 'text-yellow-600',
              isLoser && 'text-red-600'
            )}
          >
            {isWinner && '你赢了！'}
            {isDraw && '平局！'}
            {isLoser && '你输了...'}
          </h1>
          <p className="text-muted-foreground">
            {isWinner && '恭喜你成功猜出了对方的身份！'}
            {isDraw && '双方都猜对了对方的身份！'}
            {isLoser && '对方成功猜出了你的身份。'}
          </p>
        </div>

        {/* Character Reveal */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* My Secret */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">你的身份</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {mySecret && (
                <>
                  <img
                    src={getCharacterImageUrl(selectedTheme, mySecret)}
                    alt={mySecret.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-primary mb-2"
                  />
                  <p className="font-medium text-center">{mySecret.name}</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Opponent Secret */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">对方身份</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {opponentSecret && (
                <>
                  <img
                    src={getCharacterImageUrl(selectedTheme, opponentSecret)}
                    alt={opponentSecret.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-muted-foreground mb-2"
                  />
                  <p className="font-medium text-center">{opponentSecret.name}</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Guess Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">猜测详情</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Initiator Guess */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {iWasInitiator ? '你' : '对方'}发起猜测：
                </span>
                <span className="font-medium">
                  {iWasInitiator ? myFinalGuess?.name : opponentFinalGuess?.name}
                </span>
              </div>
              <div
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                  gameResult.initiatorGuessCorrect
                    ? 'bg-green-500/10 text-green-600'
                    : 'bg-red-500/10 text-red-600'
                )}
              >
                {gameResult.initiatorGuessCorrect ? (
                  <>
                    <Check className="h-3 w-3" />
                    正确
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3" />
                    错误
                  </>
                )}
              </div>
            </div>

            {/* Counter Guess (if applicable) */}
            {gameResult.counterGuessCorrect !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {iWasInitiator ? '对方' : '你'}反击猜测：
                  </span>
                  <span className="font-medium">
                    {iWasInitiator ? opponentFinalGuess?.name : myFinalGuess?.name}
                  </span>
                </div>
                <div
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                    gameResult.counterGuessCorrect
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-red-500/10 text-red-600'
                  )}
                >
                  {gameResult.counterGuessCorrect ? (
                    <>
                      <Check className="h-3 w-3" />
                      正确
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3" />
                      错误
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            onClick={handleRematch}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-5 w-5" />
            再来一局
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleReturnToLobby}
            className="flex items-center gap-2"
          >
            <Home className="h-5 w-5" />
            返回大厅
          </Button>
        </div>
      </div>
    </div>
  )
}
