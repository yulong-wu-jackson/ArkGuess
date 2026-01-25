import { Button } from '@/components/ui/button'
import { ThemeSelector } from '@/components/ThemeSelector'
import { GridSizeSelector } from '@/components/GridSizeSelector'
import { ModeSelector } from '@/components/ModeSelector'
import { CharacterPicker } from '@/components/CharacterPicker'
import { GameBoard } from '@/components/GameBoard'
import { AppProvider, useApp } from '@/contexts/AppContext'

function HomePage() {
  const { selectedTheme, gameMode, setScreen, startGame } = useApp()

  const handleStartGame = () => {
    if (gameMode === 'custom') {
      setScreen('character-select')
    } else {
      startGame()
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-8">
          ArkGuess 猜猜我是谁
        </h1>

        <div className="space-y-8">
          <ThemeSelector />

          {selectedTheme && (
            <>
              <GridSizeSelector />
              <ModeSelector />
            </>
          )}

          <div className="flex justify-center pt-4">
            <Button
              size="lg"
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
  const { selectedTheme, gridSize, gameCells, resetGame } = useApp()

  const handleEndGame = () => {
    resetGame()
  }

  if (!selectedTheme || gameCells.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">请先选择主题</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold">
            {selectedTheme.manifest.name}
          </h1>
          <Button variant="outline" onClick={handleEndGame}>
            结束游戏
          </Button>
        </div>

        <GameBoard
          cells={gameCells}
          theme={selectedTheme}
          gridSize={gridSize}
        />
      </div>
    </div>
  )
}

function AppContent() {
  const { screen } = useApp()

  switch (screen) {
    case 'home':
      return <HomePage />
    case 'character-select':
      return <CharacterSelectPage />
    case 'game':
      return <GamePage />
    default:
      return <HomePage />
  }
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
