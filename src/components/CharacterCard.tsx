import { useState } from 'react'
import { getCharacterImageUrl, getPlaceholderImageUrl } from '@/lib/theme-loader'
import type { Character, Theme, CellMarkers } from '@/types'
import { cn } from '@/lib/utils'

interface CharacterCardProps {
  character: Character
  theme: Theme
  markers?: CellMarkers
  onClick?: () => void
}

export function CharacterCard({
  character,
  theme,
  markers,
  onClick,
}: CharacterCardProps) {
  const [imageError, setImageError] = useState(false)

  const imageUrl = imageError
    ? getPlaceholderImageUrl()
    : getCharacterImageUrl(theme, character)

  const hasX = markers?.x ?? false
  const hasO = markers?.o ?? false
  const hasAnyMarker = hasX || hasO

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative aspect-square w-full overflow-hidden rounded-lg',
        'border-2 border-border bg-muted',
        'transition-all duration-150 hover:shadow-md hover:border-primary/50',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'active:scale-95',
        onClick && 'cursor-pointer'
      )}
    >
      {/* Character Image - NOT lazy loaded (game board) */}
      <img
        src={imageUrl}
        alt={character.name}
        onError={() => {
          if (!imageError) setImageError(true)
        }}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Character Name Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
        <span className="text-white text-xs sm:text-sm font-medium truncate block text-center drop-shadow-md">
          {character.name}
        </span>
      </div>

      {/* Marker Overlay - supports both X and O on same card with animations */}
      {hasAnyMarker && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center gap-1',
            'bg-black/30 animate-in fade-in duration-150'
          )}
        >
          {hasX && (
            <span className="text-3xl sm:text-4xl font-bold drop-shadow-lg text-red-500 animate-in zoom-in-75 duration-150">
              ✕
            </span>
          )}
          {hasO && (
            <span className="text-3xl sm:text-4xl font-bold drop-shadow-lg text-blue-500 animate-in zoom-in-75 duration-150">
              ○
            </span>
          )}
        </div>
      )}
    </button>
  )
}
