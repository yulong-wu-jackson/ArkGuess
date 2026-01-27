import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ThemeSelector } from '@/components/ThemeSelector'
import { GridSizeSelector } from '@/components/GridSizeSelector'
import { ModeSelector } from '@/components/ModeSelector'
import { CharacterPicker } from '@/components/CharacterPicker'
import { GameBoard } from '@/components/GameBoard'
import { MarkerTools } from '@/components/MarkerTools'
import { CreateRoomPage } from '@/components/CreateRoomPage'
import { WaitingRoomPage } from '@/components/WaitingRoomPage'
import { JoinRoomPage } from '@/components/JoinRoomPage'
import { LobbyPage } from '@/components/LobbyPage'
import { SecretSelectionPage } from '@/components/SecretSelectionPage'
import { MultiplayerGamePage } from '@/components/MultiplayerGamePage'
import { GameResultPage } from '@/components/GameResultPage'
import { AppProvider, useApp } from '@/contexts/AppContext'
import { MultiplayerProvider, useMultiplayer } from '@/contexts/MultiplayerContext'
import { Users, UserPlus, User } from 'lucide-react'

function HomePage() {
  const { setScreen } = useApp()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            ArkGuess
          </h1>
          <p className="text-xl text-muted-foreground">猜猜我是谁</p>
        </div>

        <div className="space-y-4">
          <Card
            role="button"
            tabIndex={0}
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={() => setScreen('create-room')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setScreen('create-room')
              }
            }}
          >
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">创建房间</CardTitle>
                <CardDescription>邀请好友一起玩</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card
            role="button"
            tabIndex={0}
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={() => setScreen('join-room')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setScreen('join-room')
              }
            }}
          >
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                <UserPlus className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-xl">加入房间</CardTitle>
                <CardDescription>输入房间码加入游戏</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card
            role="button"
            tabIndex={0}
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={() => setScreen('single-player-setup')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setScreen('single-player-setup')
              }
            }}
          >
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                <User className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-xl">单人游戏</CardTitle>
                <CardDescription>独自练习或测试</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-12">
          基于明日方舟角色的猜猜我是谁游戏
        </p>
      </div>
    </div>
  )
}

function SinglePlayerSetupPage() {
  const { selectedTheme, gameMode, setScreen, startGame } = useApp()

  const handleStartGame = () => {
    if (gameMode === 'custom') {
      setScreen('character-select')
    } else {
      startGame()
    }
  }

  const handleBack = () => {
    setScreen('home')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">
          单人游戏
        </h1>

        <div className="space-y-8">
          <ThemeSelector />

          {selectedTheme && (
            <>
              <GridSizeSelector />
              <ModeSelector />
            </>
          )}

          <div className="flex justify-center gap-4 pt-4">
            <Button variant="outline" onClick={handleBack}>
              返回
            </Button>
            <Button
              disabled={!selectedTheme || !gameMode}
              onClick={handleStartGame}
            >
              开始游戏
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CharacterSelectPage() {
  const {
    setScreen,
    selectedCharacters,
    requiredCharacterCount,
    setSelectedCharacters,
    startGame,
  } = useApp()

  const canStart = selectedCharacters.length === requiredCharacterCount

  const handleBack = () => {
    setSelectedCharacters([])
    setScreen('home')
  }

  const handleStartGame = () => {
    if (canStart) {
      startGame()
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">选择角色</h1>

        <CharacterPicker />

        <div className="flex justify-center gap-4 mt-8 pt-4 border-t">
          <Button variant="outline" onClick={handleBack}>
            返回
          </Button>
          <Button disabled={!canStart} onClick={handleStartGame}>
            开始游戏
          </Button>
        </div>
      </div>
    </div>
  )
}

function GamePage() {
  const { selectedTheme, gridSize, gameCells, activeMarker, toggleCellMarker, resetGame } = useApp()

  if (!selectedTheme || gameCells.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">请先选择主题</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold">
            {selectedTheme.manifest.name}
          </h1>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">结束游戏</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>结束游戏</AlertDialogTitle>
                <AlertDialogDescription>
                  确定要结束游戏吗？当前进度将丢失。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={resetGame}>确定</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <GameBoard
          cells={gameCells}
          theme={selectedTheme}
          gridSize={gridSize}
          activeMarker={activeMarker}
          onCellClick={toggleCellMarker}
        />
      </div>

      <MarkerTools />
    </div>
  )
}

function AppContent() {
  const { screen } = useApp()
  const { roomState, gamePhase } = useMultiplayer()

  // Check if we're in multiplayer mode
  const isMultiplayer = roomState !== null

  switch (screen) {
    case 'home':
      return <HomePage />
    case 'create-room':
      return <CreateRoomPage />
    case 'waiting-room':
      return <WaitingRoomPage />
    case 'join-room':
      return <JoinRoomPage />
    case 'lobby':
      return <LobbyPage />
    case 'single-player-setup':
      return <SinglePlayerSetupPage />
    case 'character-select':
      // Use SecretSelectionPage for multiplayer, CharacterSelectPage for single-player
      return isMultiplayer ? <SecretSelectionPage /> : <CharacterSelectPage />
    case 'game':
      // Show result page if game is finished in multiplayer
      if (isMultiplayer && gamePhase === 'finished') {
        return <GameResultPage />
      }
      // Use MultiplayerGamePage for multiplayer, GamePage for single-player
      return isMultiplayer ? <MultiplayerGamePage /> : <GamePage />
    default:
      return <HomePage />
  }
}

function App() {
  return (
    <AppProvider>
      <MultiplayerProvider>
        <AppContent />
      </MultiplayerProvider>
    </AppProvider>
  )
}

export default App
