import { useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { CharacterFilterBar } from '@/components/CharacterFilterBar'
import { useApp } from '@/contexts/AppContext'
import { getCharacterImageUrl, shuffleArray } from '@/lib/theme-loader'
import type { Character } from '@/types'
import { cn } from '@/lib/utils'

export function CharacterPicker() {
  const {
    selectedTheme,
    selectedCharacters,
    setSelectedCharacters,
    requiredCharacterCount,
    filteredCharacters,
  } = useApp()

  const selectedIds = useMemo(
    () => new Set(selectedCharacters.map((c) => c.id)),
    [selectedCharacters]
  )

  const isAtLimit = selectedCharacters.length >= requiredCharacterCount

  const toggleCharacter = useCallback(
    (character: Character) => {
      if (selectedIds.has(character.id)) {
        // Deselect
        setSelectedCharacters(
          selectedCharacters.filter((c) => c.id !== character.id)
        )
      } else if (!isAtLimit) {
        // Select (only if not at limit)
        setSelectedCharacters([...selectedCharacters, character])
      }
    },
    [selectedIds, selectedCharacters, setSelectedCharacters, isAtLimit]
  )

  const handleSelectAll = useCallback(() => {
    // Select first N characters needed
    setSelectedCharacters(filteredCharacters.slice(0, requiredCharacterCount))
  }, [filteredCharacters, requiredCharacterCount, setSelectedCharacters])

  const handleClearSelection = useCallback(() => {
    setSelectedCharacters([])
  }, [setSelectedCharacters])

  const handleRandomSelect = useCallback(() => {
    // Randomly pick required count
    const shuffled = shuffleArray([...filteredCharacters])
    setSelectedCharacters(shuffled.slice(0, requiredCharacterCount))
  }, [filteredCharacters, requiredCharacterCount, setSelectedCharacters])

  if (!selectedTheme) {
    return (
      <div className="text-center text-muted-foreground">
        请先选择主题
      </div>
    )
  }

  const remaining = requiredCharacterCount - selectedCharacters.length

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <CharacterFilterBar />

      {/* Counter and Quick Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-lg font-medium">
          已选择 {selectedCharacters.length}/{requiredCharacterCount}
          {remaining > 0 && (
            <span className="text-sm text-muted-foreground ml-2">
              (还需选择 {remaining} 个角色)
            </span>
          )}
          {isAtLimit && selectedCharacters.length === requiredCharacterCount && (
            <span className="text-sm text-green-600 ml-2">
              ✓ 已达到所需数量
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            全选
          </Button>
          <Button variant="outline" size="sm" onClick={handleRandomSelect}>
            随机选择
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSelection}
            disabled={selectedCharacters.length === 0}
          >
            清除选择
          </Button>
        </div>
      </div>

      {/* Character Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {filteredCharacters.map((character) => {
          const isSelected = selectedIds.has(character.id)
          const isDisabled = !isSelected && isAtLimit

          return (
            <button
              key={character.id}
              type="button"
              onClick={() => toggleCharacter(character)}
              disabled={isDisabled}
              className={cn(
                'relative flex flex-col items-center p-2 rounded-lg border-2 transition-all',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-transparent bg-muted/50 hover:bg-muted',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-xs">✓</span>
                </div>
              )}

              {/* Character Image - lazy loaded */}
              <img
                src={getCharacterImageUrl(selectedTheme, character)}
                alt={character.name}
                loading="lazy"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover bg-muted"
              />

              {/* Character Name */}
              <span className="mt-1 text-xs sm:text-sm text-center truncate w-full">
                {character.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
