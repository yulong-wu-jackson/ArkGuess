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

export type GameMode = 'random' | 'custom'
