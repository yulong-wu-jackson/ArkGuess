import { useEffect, useRef, useState } from 'react'
import { useMultiplayer } from '@/contexts/MultiplayerContext'
import { cn } from '@/lib/utils'
import type { EmoteId } from '@/types/multiplayer'

const DISPLAY_DURATION_MS = 3000

const EMOTE_LABELS: Record<EmoteId, string> = {
  cooperate: '合作',
  happy: '开心',
  scared: '害怕',
  sorry: '抱歉',
  thanks: '感谢',
  thinking: '思考',
}

export function EmoteDisplay() {
  const { receivedEmote, clearReceivedEmote } = useMultiplayer()
  const [visible, setVisible] = useState(false)
  const [displayedEmote, setDisplayedEmote] = useState<EmoteId | null>(null)
  const lastTimestampRef = useRef<number | null>(null)

  useEffect(() => {
    if (!receivedEmote) return

    // Ignore if this is the same emote we already processed
    if (lastTimestampRef.current === receivedEmote.timestamp) return

    lastTimestampRef.current = receivedEmote.timestamp

    // Schedule the state updates in a microtask to avoid synchronous setState in effect
    queueMicrotask(() => {
      setDisplayedEmote(receivedEmote.emoteId)
      setVisible(true)
    })

    // Set up timer to hide and clear
    const hideTimer = setTimeout(() => {
      setVisible(false)
    }, DISPLAY_DURATION_MS - 200) // Start fade-out slightly before clearing

    const clearTimer = setTimeout(() => {
      clearReceivedEmote()
      setDisplayedEmote(null)
      lastTimestampRef.current = null
    }, DISPLAY_DURATION_MS)

    return () => {
      clearTimeout(hideTimer)
      clearTimeout(clearTimer)
    }
  }, [receivedEmote, clearReceivedEmote])

  if (!displayedEmote) return null

  return (
    <div className="fixed top-20 right-4 z-50 pointer-events-none">
      <div
        className={cn(
          'flex flex-col items-center gap-2 p-3 rounded-xl',
          'bg-background/95 backdrop-blur-sm shadow-lg border',
          'transition-all duration-200',
          visible
            ? 'opacity-100 scale-100 animate-in fade-in zoom-in-95'
            : 'opacity-0 scale-95 animate-out fade-out zoom-out-95'
        )}
      >
        <img
          src={`${import.meta.env.BASE_URL}images/emotes/${displayedEmote}.png`}
          alt={EMOTE_LABELS[displayedEmote]}
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
        />
        <span className="text-xs text-muted-foreground">
          {EMOTE_LABELS[displayedEmote]}
        </span>
      </div>
    </div>
  )
}
