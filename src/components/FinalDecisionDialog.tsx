import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useMultiplayer } from '@/contexts/MultiplayerContext'
import { useApp } from '@/contexts/AppContext'
import { getCharacterImageUrl } from '@/lib/theme-loader'
import type { Character } from '@/types'
import { cn } from '@/lib/utils'
import { AlertTriangle, Check } from 'lucide-react'

interface FinalDecisionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FinalDecisionDialog({ open, onOpenChange }: FinalDecisionDialogProps) {
  const { selectedTheme } = useApp()
  const {
    roomState,
    submitFinalGuess,
    mustCounterGuess,
  } = useMultiplayer()

  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)

  const characters = roomState?.selectedCharacters ?? []
  const gridSize = roomState?.gridSize ?? 4

  const handleConfirm = () => {
    if (selectedCharacter) {
      submitFinalGuess(selectedCharacter)
      onOpenChange(false)
      setSelectedCharacter(null)
    }
  }

  const handleCancel = () => {
    if (!mustCounterGuess) {
      onOpenChange(false)
      setSelectedCharacter(null)
    }
  }

  if (!selectedTheme) return null

  return (
    <Dialog open={open} onOpenChange={mustCounterGuess ? undefined : onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mustCounterGuess ? (
              <>
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                反击猜测
              </>
            ) : (
              '最终决策'
            )}
          </DialogTitle>
          <DialogDescription>
            {mustCounterGuess ? (
              <span className="text-orange-600 font-medium">
                对方猜对了你的身份！你需要立即反击猜测。
              </span>
            ) : (
              <span className="text-destructive font-medium">
                警告：猜错将直接输掉比赛！
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            选择你认为对方的秘密角色：
          </p>

          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${Math.min(gridSize, 5)}, minmax(0, 1fr))`,
            }}
          >
            {characters.map((character) => {
              const isSelected = selectedCharacter?.id === character.id

              return (
                <button
                  key={character.id}
                  type="button"
                  onClick={() => setSelectedCharacter(character)}
                  className={cn(
                    'relative flex flex-col items-center p-1.5 rounded-lg border-2 transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    isSelected
                      ? 'border-primary bg-primary/10 ring-2 ring-primary'
                      : 'border-transparent bg-muted/50 hover:bg-muted'
                  )}
                >
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}

                  <img
                    src={getCharacterImageUrl(selectedTheme, character)}
                    alt={character.name}
                    className="w-12 h-12 rounded-full object-cover bg-muted"
                  />

                  <span className="mt-1 text-xs text-center truncate w-full">
                    {character.name}
                  </span>
                </button>
              )
            })}
          </div>

          {selectedCharacter && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm">
                已选择：<span className="font-medium">{selectedCharacter.name}</span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {!mustCounterGuess && (
            <Button variant="outline" onClick={handleCancel}>
              取消
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            disabled={!selectedCharacter}
            variant={mustCounterGuess ? 'default' : 'destructive'}
          >
            {mustCounterGuess ? '确认反击' : '确认猜测'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
