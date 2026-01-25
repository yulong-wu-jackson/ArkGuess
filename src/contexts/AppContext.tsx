import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Theme, GameMode, Character, CellState } from '@/types'
import { selectRandomCharacters } from '@/lib/theme-loader'

type Screen = 'home' | 'character-select' | 'game'

interface AppState {
  screen: Screen
  selectedTheme: Theme | null
  gridSize: number
  gameMode: GameMode | null
  selectedCharacters: Character[]
  gameCells: CellState[]
}

interface AppContextValue extends AppState {
  setScreen: (screen: Screen) => void
  setSelectedTheme: (theme: Theme | null) => void
  setGridSize: (size: number) => void
  setGameMode: (mode: GameMode | null) => void
  setSelectedCharacters: (characters: Character[]) => void
  startGame: () => void
  resetGame: () => void
  canStartGame: boolean
  requiredCharacterCount: number
}

const initialState: AppState = {
  screen: 'home',
  selectedTheme: null,
  gridSize: 4,
  gameMode: null,
  selectedCharacters: [],
  gameCells: [],
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState)

  const setScreen = useCallback((screen: Screen) => {
    setState((prev) => ({ ...prev, screen }))
  }, [])

  const setSelectedTheme = useCallback((theme: Theme | null) => {
    setState((prev) => ({ ...prev, selectedTheme: theme }))
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
        marker: null,
      }))

      return {
        ...prev,
        gameCells,
        screen: 'game' as Screen,
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

  return (
    <AppContext.Provider
      value={{
        ...state,
        setScreen,
        setSelectedTheme,
        setGridSize,
        setGameMode,
        setSelectedCharacters,
        startGame,
        resetGame,
        canStartGame,
        requiredCharacterCount,
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
