import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import type { Theme, GameMode, Character, CellState } from '@/types'
import { selectRandomCharacters } from '@/lib/theme-loader'

type Screen = 'home' | 'character-select' | 'game'

type ActiveMarker = 'x' | 'o'

interface AppState {
  screen: Screen
  selectedTheme: Theme | null
  gridSize: number
  gameMode: GameMode | null
  selectedCharacters: Character[]
  gameCells: CellState[]
  activeMarker: ActiveMarker
  characterSearchQuery: string
  selectedTagFilters: string[]
  selectedRarityFilters: string[]
  selectedFactionFilters: string[]
  selectedClassFilters: string[]
}

interface AppContextValue extends AppState {
  setScreen: (screen: Screen) => void
  setSelectedTheme: (theme: Theme | null) => void
  setGridSize: (size: number) => void
  setGameMode: (mode: GameMode | null) => void
  setSelectedCharacters: (characters: Character[]) => void
  setActiveMarker: (marker: ActiveMarker) => void
  setCharacterSearchQuery: (query: string) => void
  setSelectedTagFilters: (tags: string[]) => void
  setSelectedRarityFilters: (rarities: string[]) => void
  setSelectedFactionFilters: (factions: string[]) => void
  setSelectedClassFilters: (classes: string[]) => void
  toggleCellMarker: (cellIndex: number) => void
  startGame: () => void
  resetGame: () => void
  canStartGame: boolean
  requiredCharacterCount: number
  filteredCharacters: Character[]
}

const initialState: AppState = {
  screen: 'home',
  selectedTheme: null,
  gridSize: 4,
  gameMode: null,
  selectedCharacters: [],
  gameCells: [],
  activeMarker: 'x',
  characterSearchQuery: '',
  selectedTagFilters: [],
  selectedRarityFilters: [],
  selectedFactionFilters: [],
  selectedClassFilters: [],
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState)

  const setScreen = useCallback((screen: Screen) => {
    setState((prev) => ({ ...prev, screen }))
  }, [])

  const setSelectedTheme = useCallback((theme: Theme | null) => {
    setState((prev) => ({
      ...prev,
      selectedTheme: theme,
      // Clear all filters when theme changes to prevent invalid filter state
      characterSearchQuery: '',
      selectedTagFilters: [],
      selectedRarityFilters: [],
      selectedFactionFilters: [],
      selectedClassFilters: [],
    }))
  }, [])

  const setGridSize = useCallback((gridSize: number) => {
    setState((prev) => ({ ...prev, gridSize }))
  }, [])

  const setGameMode = useCallback((gameMode: GameMode | null) => {
    setState((prev) => ({ ...prev, gameMode }))
  }, [])

  const setSelectedCharacters = useCallback((selectedCharacters: Character[]) => {
    setState((prev) => ({ ...prev, selectedCharacters }))
  }, [])

  const setActiveMarker = useCallback((activeMarker: ActiveMarker) => {
    setState((prev) => ({ ...prev, activeMarker }))
  }, [])

  const setCharacterSearchQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, characterSearchQuery: query }))
  }, [])

  const setSelectedTagFilters = useCallback((tags: string[]) => {
    setState((prev) => ({ ...prev, selectedTagFilters: tags }))
  }, [])

  const setSelectedRarityFilters = useCallback((rarities: string[]) => {
    setState((prev) => ({ ...prev, selectedRarityFilters: rarities }))
  }, [])

  const setSelectedFactionFilters = useCallback((factions: string[]) => {
    setState((prev) => ({ ...prev, selectedFactionFilters: factions }))
  }, [])

  const setSelectedClassFilters = useCallback((classes: string[]) => {
    setState((prev) => ({ ...prev, selectedClassFilters: classes }))
  }, [])

  const toggleCellMarker = useCallback((cellIndex: number) => {
    setState((prev) => {
      const newCells = [...prev.gameCells]
      const cell = newCells[cellIndex]
      if (!cell) return prev

      // Toggle the active marker on this cell (both X and O can coexist)
      const newMarkers = {
        ...cell.markers,
        [prev.activeMarker]: !cell.markers[prev.activeMarker],
      }

      newCells[cellIndex] = {
        ...cell,
        markers: newMarkers,
      }

      return {
        ...prev,
        gameCells: newCells,
      }
    })
  }, [])

  const startGame = useCallback(() => {
    setState((prev) => {
      if (!prev.selectedTheme) return prev

      // Determine which characters to use
      let characters: Character[]
      if (prev.gameMode === 'random') {
        // For random mode, select random characters now (only once)
        const requiredCount = prev.gridSize * prev.gridSize
        characters = selectRandomCharacters(
          prev.selectedTheme.manifest.characters,
          requiredCount
        )
      } else {
        // For custom mode, use selected characters
        characters = prev.selectedCharacters
      }

      // Create cells from characters
      const gameCells: CellState[] = characters.map((character) => ({
        character,
        markers: { x: false, o: false },
      }))

      return {
        ...prev,
        gameCells,
        screen: 'game',
      }
    })
  }, [])

  const resetGame = useCallback(() => {
    setState(initialState)
  }, [])

  const requiredCharacterCount = state.gridSize * state.gridSize

  const canStartGame =
    state.selectedTheme !== null &&
    state.gameMode !== null &&
    (state.gameMode === 'random' ||
      state.selectedCharacters.length === requiredCharacterCount)

  // Compute filtered characters based on search + tags
  const filteredCharacters = useMemo(() => {
    if (!state.selectedTheme?.metadata) {
      return state.selectedTheme?.manifest.characters ?? []
    }

    let characters = state.selectedTheme.manifest.characters
    const metadata = state.selectedTheme.metadata.characters

    // Filter by search query (name, class, faction)
    if (state.characterSearchQuery) {
      const query = state.characterSearchQuery.toLowerCase()
      characters = characters.filter(char => {
        const meta = metadata[char.id]
        // Characters without metadata are still searchable by name
        if (!meta) {
          return char.name.toLowerCase().includes(query)
        }
        return (
          char.name.toLowerCase().includes(query) ||
          meta.class?.toLowerCase().includes(query) ||
          meta.faction?.toLowerCase().includes(query)
        )
      })
    }

    // Filter by tags (AND logic - character must have ALL selected tags)
    if (state.selectedTagFilters.length > 0) {
      characters = characters.filter(char => {
        const meta = metadata[char.id]
        if (!meta?.tags) return false
        // Character must have ALL selected tags
        return state.selectedTagFilters.every(tag => meta.tags?.includes(tag))
      })
    }

    // Filter by rarity (OR logic - character can match ANY selected rarity)
    if (state.selectedRarityFilters.length > 0) {
      characters = characters.filter(char => {
        const meta = metadata[char.id]
        if (!meta?.rarityLabel) return false
        return state.selectedRarityFilters.includes(meta.rarityLabel)
      })
    }

    // Filter by faction (OR logic - character can match ANY selected faction)
    if (state.selectedFactionFilters.length > 0) {
      characters = characters.filter(char => {
        const meta = metadata[char.id]
        if (!meta?.faction) return false
        return state.selectedFactionFilters.includes(meta.faction)
      })
    }

    // Filter by class (OR logic - character can match ANY selected class)
    if (state.selectedClassFilters.length > 0) {
      characters = characters.filter(char => {
        const meta = metadata[char.id]
        if (!meta?.class) return false
        return state.selectedClassFilters.includes(meta.class)
      })
    }

    return characters
  }, [
    state.selectedTheme,
    state.characterSearchQuery,
    state.selectedTagFilters,
    state.selectedRarityFilters,
    state.selectedFactionFilters,
    state.selectedClassFilters,
  ])

  return (
    <AppContext.Provider
      value={{
        ...state,
        setScreen,
        setSelectedTheme,
        setGridSize,
        setGameMode,
        setSelectedCharacters,
        setActiveMarker,
        setCharacterSearchQuery,
        setSelectedTagFilters,
        setSelectedRarityFilters,
        setSelectedFactionFilters,
        setSelectedClassFilters,
        toggleCellMarker,
        startGame,
        resetGame,
        canStartGame,
        requiredCharacterCount,
        filteredCharacters,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
