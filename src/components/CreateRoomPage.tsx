import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ThemeSelector } from '@/components/ThemeSelector'
import { GridSizeSelector } from '@/components/GridSizeSelector'
import { ModeSelector } from '@/components/ModeSelector'
import { useApp } from '@/contexts/AppContext'
import { useMultiplayer } from '@/contexts/MultiplayerContext'
import { ArrowLeft, Loader2 } from 'lucide-react'

export function CreateRoomPage() {
  const { selectedTheme, gameMode, gridSize, setScreen } = useApp()
  const { createRoom } = useMultiplayer()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canCreate = selectedTheme !== null && gameMode !== null

  const handleCreate = async () => {
    if (!selectedTheme || !gameMode) return

    setIsCreating(true)
    setError(null)

    try {
      await createRoom(gridSize, selectedTheme.manifest.characters)
      setScreen('waiting-room')
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建房间失败')
      setIsCreating(false)
    }
  }

  const handleBack = () => {
    setScreen('home')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">创建房间</h1>
        </div>

        <div className="space-y-8">
          <ThemeSelector />

          {selectedTheme && (
            <>
              <GridSizeSelector />
              <ModeSelector />
            </>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-center gap-4 pt-4">
            <Button variant="outline" onClick={handleBack}>
              取消
            </Button>
            <Button disabled={!canCreate || isCreating} onClick={handleCreate}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  创建中...
                </>
              ) : (
                '创建房间'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
