import { useState } from 'react'
import { getCharacterImageUrl, getPlaceholderImageUrl } from '@/lib/theme-loader'
import type { Character, Theme, MarkerType } from '@/types'
import { cn } from '@/lib/utils'

interface CharacterCardProps {
  character: Character
  theme: Theme
  marker?: MarkerType
  onClick?: () => void
}

export function CharacterCard({
  character,
  theme,
  marker,
  onClick,
}: CharacterCardProps) {
  const [imageError, setImageError] = useState(false)

  const imageUrl = imageError
    ? getPlaceholderImageUrl()
    : getCharacterImageUrl(theme, character)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative aspect-square w-full overflow-hidden rounded-lg',
        'border-2 border-border bg-muted',
        'transition-all hover:shadow-md hover:border-primary/50',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        onClick && 'cursor-pointer'
      )}
    >
      {/* Character Image */}
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

      {/* Marker Overlay - will be used in ticket_006 */}
      {marker && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'bg-black/30'
          )}
        >
          <span
            className={cn(
              'text-4xl sm:text-5xl font-bold drop-shadow-lg',
              marker === 'x' ? 'text-red-500' : 'text-blue-500'
            )}
          >
            {marker === 'x' ? '✕' : '○'}
          </span>
        </div>
      )}
    </button>
  )
}
