import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, X } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { cn } from '@/lib/utils'

export function CharacterFilterBar() {
  const {
    selectedTheme,
    characterSearchQuery,
    setCharacterSearchQuery,
    selectedTagFilters,
    setSelectedTagFilters,
    selectedRarityFilters,
    setSelectedRarityFilters,
    selectedFactionFilters,
    setSelectedFactionFilters,
    selectedClassFilters,
    setSelectedClassFilters,
  } = useApp()

  if (!selectedTheme?.metadata) return null

  const allTags = Object.keys(selectedTheme.metadata.indexes.byTag).sort()
  const allRarities = Object.keys(selectedTheme.metadata.indexes.byRarity).sort()
  const allFactions = Object.keys(selectedTheme.metadata.indexes.byFaction).sort()
  const allClasses = Object.keys(selectedTheme.metadata.indexes.byClass).sort()

  const toggleTag = (tag: string) => {
    setSelectedTagFilters(
      selectedTagFilters.includes(tag)
        ? selectedTagFilters.filter(t => t !== tag)
        : [...selectedTagFilters, tag]
    )
  }

  const toggleRarity = (rarity: string) => {
    setSelectedRarityFilters(
      selectedRarityFilters.includes(rarity)
        ? selectedRarityFilters.filter(r => r !== rarity)
        : [...selectedRarityFilters, rarity]
    )
  }

  const toggleFaction = (faction: string) => {
    setSelectedFactionFilters(
      selectedFactionFilters.includes(faction)
        ? selectedFactionFilters.filter(f => f !== faction)
        : [...selectedFactionFilters, faction]
    )
  }

  const toggleClass = (className: string) => {
    setSelectedClassFilters(
      selectedClassFilters.includes(className)
        ? selectedClassFilters.filter(c => c !== className)
        : [...selectedClassFilters, className]
    )
  }

  const clearFilters = () => {
    setCharacterSearchQuery('')
    setSelectedTagFilters([])
    setSelectedRarityFilters([])
    setSelectedFactionFilters([])
    setSelectedClassFilters([])
  }

  const hasActiveFilters =
    characterSearchQuery ||
    selectedTagFilters.length > 0 ||
    selectedRarityFilters.length > 0 ||
    selectedFactionFilters.length > 0 ||
    selectedClassFilters.length > 0

  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="搜索角色名称、职业、阵营..."
          value={characterSearchQuery}
          onChange={(e) => setCharacterSearchQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {characterSearchQuery && (
          <button
            onClick={() => setCharacterSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Header with Clear Button */}
      {hasActiveFilters && (
        <div className="flex items-center justify-end">
          <button
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            清除所有筛选
          </button>
        </div>
      )}

      {/* Rarity Filters */}
      {allRarities.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium">稀有度</span>
          <div className="flex flex-wrap gap-2">
            {allRarities.map(rarity => {
              const isSelected = selectedRarityFilters.includes(rarity)
              const count = selectedTheme.metadata?.indexes.byRarity?.[rarity]?.length ?? 0

              return (
                <Badge
                  key={rarity}
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-all',
                    isSelected && 'bg-primary text-primary-foreground'
                  )}
                  onClick={() => toggleRarity(rarity)}
                >
                  {rarity} ({count})
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      {/* Faction Filters */}
      {allFactions.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium">阵营</span>
          <div className="flex flex-wrap gap-2">
            {allFactions.map(faction => {
              const isSelected = selectedFactionFilters.includes(faction)
              const count = selectedTheme.metadata?.indexes.byFaction?.[faction]?.length ?? 0

              return (
                <Badge
                  key={faction}
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-all',
                    isSelected && 'bg-primary text-primary-foreground'
                  )}
                  onClick={() => toggleFaction(faction)}
                >
                  {faction} ({count})
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      {/* Class Filters */}
      {allClasses.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium">职业</span>
          <div className="flex flex-wrap gap-2">
            {allClasses.map(className => {
              const isSelected = selectedClassFilters.includes(className)
              const count = selectedTheme.metadata?.indexes.byClass?.[className]?.length ?? 0

              return (
                <Badge
                  key={className}
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-all',
                    isSelected && 'bg-primary text-primary-foreground'
                  )}
                  onClick={() => toggleClass(className)}
                >
                  {className} ({count})
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium">标签</span>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => {
              const isSelected = selectedTagFilters.includes(tag)
              const count = selectedTheme.metadata?.indexes.byTag?.[tag]?.length ?? 0

              return (
                <Badge
                  key={tag}
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-all',
                    isSelected && 'bg-primary text-primary-foreground'
                  )}
                  onClick={() => toggleTag(tag)}
                >
                  {tag} ({count})
                </Badge>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
