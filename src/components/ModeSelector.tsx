import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/contexts/AppContext'
import type { GameMode } from '@/types'
import { cn } from '@/lib/utils'

interface ModeOption {
  mode: GameMode
  title: string
  description: string
}

const MODES: ModeOption[] = [
  {
    mode: 'random',
    title: '随机模式',
    description: '随机分配角色到网格',
  },
  {
    mode: 'custom',
    title: '自选模式',
    description: '选择你想要的角色',
  },
]

export function ModeSelector() {
  const { gameMode, setGameMode } = useApp()

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-center">选择模式</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MODES.map(({ mode, title, description }) => {
          const isSelected = gameMode === mode

          return (
            <Card
              key={mode}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                isSelected && 'ring-2 ring-primary'
              )}
              onClick={() => setGameMode(mode)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
