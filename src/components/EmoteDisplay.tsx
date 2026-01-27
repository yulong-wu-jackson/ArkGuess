import { useEffect, useRef, useState } from 'react'
import { useMultiplayer } from '@/contexts/MultiplayerContext'
import { cn } from '@/lib/utils'
import type { EmoteId } from '@/types/multiplayer'

const DISPLAY_DURATION_MS = 2500

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
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'idle' | 'exit'>('enter')
  const lastTimestampRef = useRef<number | null>(null)

  useEffect(() => {
    if (!receivedEmote) return

    // Ignore if this is the same emote we already processed
    if (lastTimestampRef.current === receivedEmote.timestamp) return

    lastTimestampRef.current = receivedEmote.timestamp

    // Schedule the state updates in a microtask to avoid synchronous setState in effect
    queueMicrotask(() => {
      setDisplayedEmote(receivedEmote.emoteId)
      setAnimationPhase('enter')
      setVisible(true)
    })

    // Transition to idle after entrance animation
    const idleTimer = setTimeout(() => {
      setAnimationPhase('idle')
    }, 400)

    // Start exit animation
    const exitTimer = setTimeout(() => {
      setAnimationPhase('exit')
    }, DISPLAY_DURATION_MS - 400)

    // Set up timer to hide and clear
    const hideTimer = setTimeout(() => {
      setVisible(false)
    }, DISPLAY_DURATION_MS - 100)

    const clearTimer = setTimeout(() => {
      clearReceivedEmote()
      setDisplayedEmote(null)
      lastTimestampRef.current = null
    }, DISPLAY_DURATION_MS)

    return () => {
      clearTimeout(idleTimer)
      clearTimeout(exitTimer)
      clearTimeout(hideTimer)
      clearTimeout(clearTimer)
    }
  }, [receivedEmote, clearReceivedEmote])

  if (!displayedEmote) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      <div
        className={cn(
          'relative p-5 rounded-2xl',
          // Frosted glass effect (毛玻璃)
          'bg-white/20 dark:bg-black/20',
          'backdrop-blur-xl',
          'border border-white/30 dark:border-white/10',
          'shadow-2xl shadow-black/10',
          // Base transition
          'transition-all duration-300 ease-out',
          // Animation phases
          animationPhase === 'enter' && 'animate-emote-enter',
          animationPhase === 'idle' && 'animate-emote-idle',
          animationPhase === 'exit' && 'animate-emote-exit',
          !visible && 'opacity-0 scale-0'
        )}
      >
        {/* Glow effect behind emote */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent" />

        <img
          src={`${import.meta.env.BASE_URL}images/emotes/${displayedEmote}.png`}
          alt={EMOTE_LABELS[displayedEmote]}
          className={cn(
            'relative w-24 h-24 sm:w-28 sm:h-28 object-contain',
            'drop-shadow-lg',
            animationPhase === 'idle' && 'animate-emote-bounce'
          )}
        />
      </div>
    </div>
  )
}
