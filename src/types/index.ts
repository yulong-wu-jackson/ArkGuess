export interface Character {
  id: string
  name: string
  image: string
}

export interface ThemeManifest {
  name: string
  characters: Character[]
}

export interface CharacterMetadata {
  name: string
  image: string
  rarity?: number
  rarityLabel?: string
  class?: string
  subclass?: string
  tags?: string[]
  position?: string
  faction?: string
}

export interface ThemeMetadata {
  version: string
  lastUpdated: string
  characters: Record<string, CharacterMetadata>
  indexes: {
    byRarity: Record<string, string[]>
    byClass: Record<string, string[]>
    bySubclass: Record<string, string[]>
    byTag: Record<string, string[]>
    byPosition: Record<string, string[]>
    byFaction: Record<string, string[]>
  }
}

export interface Theme {
  id: string
  manifest: ThemeManifest
  metadata?: ThemeMetadata
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
