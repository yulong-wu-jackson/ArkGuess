import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useMultiplayer } from '@/contexts/MultiplayerContext'
import { cn } from '@/lib/utils'
import { Smile } from 'lucide-react'
import type { EmoteId } from '@/types/multiplayer'

interface EmoteConfig {
  id: EmoteId
  label: string
}

const EMOTES: EmoteConfig[] = [
  { id: 'cooperate', label: '合作' },
  { id: 'happy', label: '开心' },
  { id: 'scared', label: '害怕' },
  { id: 'sorry', label: '抱歉' },
  { id: 'thanks', label: '感谢' },
  { id: 'thinking', label: '思考' },
]

const COOLDOWN_MS = 1000

export function EmotePicker() {
  const { sendEmote, isConnected } = useMultiplayer()
  const [open, setOpen] = useState(false)
  const [cooldown, setCooldown] = useState(false)
  const [cooldownProgress, setCooldownProgress] = useState(0)
  const cooldownStartRef = useRef<number | null>(null)

  useEffect(() => {
    if (!cooldown) {
      cooldownStartRef.current = null
      return
    }

    cooldownStartRef.current = Date.now()

    const interval = setInterval(() => {
      if (!cooldownStartRef.current) return

      const elapsed = Date.now() - cooldownStartRef.current
      const progress = Math.min(elapsed / COOLDOWN_MS, 1)

      if (progress >= 1) {
        setCooldown(false)
        setCooldownProgress(0)
        clearInterval(interval)
      } else {
        setCooldownProgress(progress)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [cooldown])

  const handleSendEmote = useCallback(
    (emoteId: EmoteId) => {
      if (cooldown || !isConnected) return

      sendEmote(emoteId)
      setOpen(false)
      setCooldown(true)
      setCooldownProgress(0)
    },
    [cooldown, isConnected, sendEmote]
  )

  const isDisabled = !isConnected || cooldown

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            disabled={isDisabled}
            className={cn(
              'h-12 w-12 rounded-full shadow-lg bg-background/95 backdrop-blur-sm',
              'transition-all duration-200',
              cooldown && 'relative overflow-hidden'
            )}
          >
            <Smile className="h-6 w-6" />
            {cooldown && (
              <div
                className="absolute inset-0 bg-muted-foreground/20 transition-all"
                style={{
                  clipPath: `inset(${cooldownProgress * 100}% 0 0 0)`,
                }}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          className="w-auto p-2"
          sideOffset={8}
        >
          <div className="grid grid-cols-3 gap-2">
            {EMOTES.map((emote) => (
              <button
                key={emote.id}
                type="button"
                onClick={() => handleSendEmote(emote.id)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg',
                  'transition-all duration-150',
                  'hover:bg-accent hover:scale-105',
                  'active:scale-95',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
                )}
              >
                <img
                  src={`${import.meta.env.BASE_URL}images/emotes/${emote.id}.png`}
                  alt={emote.label}
                  className="w-12 h-12 object-contain"
                />
                <span className="text-xs text-muted-foreground">
                  {emote.label}
                </span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
