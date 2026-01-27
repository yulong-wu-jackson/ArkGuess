import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
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
import { GameBoard } from '@/components/GameBoard'
import { FinalDecisionDialog } from '@/components/FinalDecisionDialog'
import { useApp } from '@/contexts/AppContext'
import { useMultiplayer } from '@/contexts/MultiplayerContext'
import { getCharacterImageUrl } from '@/lib/theme-loader'
import type { CellState } from '@/types'
import { cn } from '@/lib/utils'
import { Wifi, WifiOff, Eye, User, Target, Clock } from 'lucide-react'

export function MultiplayerGamePage() {
  const { selectedTheme, setScreen } = useApp()
  const {
    roomState,
    mySecretCharacter,
    myMarkers,
    opponentMarkers,
    currentView,
    activeMarker,
    isConnected,
    toggleCellMarker,
    setCurrentView,
    setActiveMarker,
    leaveRoom,
    mustCounterGuess,
    gamePhase,
  } = useMultiplayer()

  const [showFinalDecision, setShowFinalDecision] = useState(false)

  const characters = roomState?.selectedCharacters ?? []
  const gridSize = roomState?.gridSize ?? 4

  // Build cells based on current view
  const currentMarkers = currentView === 'my' ? myMarkers : opponentMarkers
  const cells: CellState[] = characters.map((character, index) => ({
    character,
    markers: currentMarkers[index] ?? { x: false, o: false },
  }))

  const isViewingOpponent = currentView === 'opponent'
  const isWaitingForResult = gamePhase === 'waiting_for_result'

  // Auto-open dialog when counter-guess is required
  useEffect(() => {
    if (mustCounterGuess) {
      // Schedule state update to avoid calling setState during render
      setTimeout(() => {
        setShowFinalDecision(true)
      }, 0)
    }
  }, [mustCounterGuess])

  // Navigate to result page when game is finished
  useEffect(() => {
    if (gamePhase === 'finished') {
      setScreen('game') // Will show GameResultPage due to routing
    }
  }, [gamePhase, setScreen])

  const handleEndGame = () => {
    leaveRoom()
    setScreen('home')
  }

  if (!selectedTheme || characters.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-28">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold">
              {selectedTheme.manifest.name}
            </h1>
            {/* Connection Status */}
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                isConnected
                  ? 'bg-green-500/10 text-green-600'
                  : 'bg-red-500/10 text-red-600'
              )}
            >
              {isConnected ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              <span>{isConnected ? '已连接' : '断开'}</span>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                结束游戏
              </Button>
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
                <AlertDialogAction onClick={handleEndGame}>确定</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Waiting for Result Banner */}
        {isWaitingForResult && !mustCounterGuess && (
          <div className="flex items-center justify-center gap-2 mb-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <Clock className="h-4 w-4 text-yellow-600 animate-pulse" />
            <p className="text-sm text-yellow-600 font-medium">
              等待对方响应...
            </p>
          </div>
        )}

        {/* Counter-Guess Required Banner */}
        {mustCounterGuess && (
          <div className="flex items-center justify-center gap-2 mb-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <p className="text-sm text-orange-600 font-medium">
              对方猜对了你的身份！点击按钮进行反击猜测。
            </p>
          </div>
        )}

        {/* Secret Character Display */}
        {mySecretCharacter && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <img
              src={getCharacterImageUrl(selectedTheme, mySecretCharacter)}
              alt={mySecretCharacter.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary"
            />
            <div>
              <p className="text-xs text-muted-foreground">你的身份</p>
              <p className="font-medium">{mySecretCharacter.name}</p>
            </div>
          </div>
        )}

        {/* View Toggle */}
        <div className="flex justify-center gap-2 mb-4">
          <Button
            variant={currentView === 'my' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('my')}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            我的标记
          </Button>
          <Button
            variant={currentView === 'opponent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('opponent')}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            对方标记
          </Button>
        </div>

        {/* Read-only indicator for opponent view */}
        {isViewingOpponent && (
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">
              正在查看对方的标记（只读）
            </p>
          </div>
        )}

        {/* Game Board */}
        <GameBoard
          cells={cells}
          theme={selectedTheme}
          gridSize={gridSize}
          activeMarker={activeMarker}
          onCellClick={isViewingOpponent || isWaitingForResult ? undefined : toggleCellMarker}
        />

        {/* Final Decision Button */}
        <div className="flex justify-center mt-6">
          <Button
            size="lg"
            className="flex items-center gap-2"
            onClick={() => setShowFinalDecision(true)}
            disabled={isWaitingForResult && !mustCounterGuess}
            variant={mustCounterGuess ? 'destructive' : 'default'}
          >
            <Target className="h-5 w-5" />
            {mustCounterGuess ? '反击猜测' : '最终决策'}
          </Button>
        </div>
      </div>

      {/* Marker Tools - Fixed at bottom */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-background/95 backdrop-blur-sm rounded-full shadow-lg border">
        <button
          type="button"
          onClick={() => setActiveMarker('x')}
          disabled={isViewingOpponent || isWaitingForResult}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
            (isViewingOpponent || isWaitingForResult) && 'opacity-50 cursor-not-allowed',
            activeMarker === 'x'
              ? 'bg-red-500 text-white shadow-md scale-105'
              : 'bg-muted hover:bg-red-100 text-red-600'
          )}
        >
          <span className="text-xl font-bold">✕</span>
          <span className="text-sm font-medium hidden sm:inline">红方 (X)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMarker('o')}
          disabled={isViewingOpponent || isWaitingForResult}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            (isViewingOpponent || isWaitingForResult) && 'opacity-50 cursor-not-allowed',
            activeMarker === 'o'
              ? 'bg-blue-500 text-white shadow-md scale-105'
              : 'bg-muted hover:bg-blue-100 text-blue-600'
          )}
        >
          <span className="text-xl font-bold">○</span>
          <span className="text-sm font-medium hidden sm:inline">蓝方 (O)</span>
        </button>
      </div>

      {/* Final Decision Dialog */}
      <FinalDecisionDialog
        open={showFinalDecision}
        onOpenChange={setShowFinalDecision}
      />
    </div>
  )
}
