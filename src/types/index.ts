export interface Character {
  id: string
  name: string
  image: string
}

export interface ThemeManifest {
  name: string
  characters: Character[]
}

export interface Theme {
  id: string
  manifest: ThemeManifest
  basePath: string
}

export type MarkerType = 'x' | 'o'

export interface CellMarkers {
  x: boolean
  o: boolean
}

export interface CellState {
  character: Character
  markers: CellMarkers
}

export interface GameState {
  theme: Theme
  gridSize: number
  cells: CellState[]
  activeMarker: 'x' | 'o'
}

export type GameMode = 'random' | 'custom'

export interface GameConfig {
  theme: Theme
  gridSize: number
  mode: GameMode
  selectedCharacters?: Character[]
}
