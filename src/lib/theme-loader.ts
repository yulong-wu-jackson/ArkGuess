import type { Character, Theme, ThemeManifest, ThemeMetadata } from '@/types'

const BASE_PATH = import.meta.env.BASE_URL + 'images'
const PLACEHOLDER_IMAGE = import.meta.env.BASE_URL + 'placeholder.svg'

const AVAILABLE_THEMES = ['arknights'] as const

export async function loadThemeManifest(themeId: string): Promise<ThemeManifest> {
  const url = `${BASE_PATH}/${themeId}/manifest.json`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to load manifest: ${response.status}`)
    }
    const manifest: ThemeManifest = await response.json()
    return manifest
  } catch (error) {
    console.warn(`Failed to load theme manifest for "${themeId}":`, error)
    throw new Error(`Theme "${themeId}" not found or invalid manifest`)
  }
}

export async function loadThemeMetadata(themeId: string): Promise<ThemeMetadata | null> {
  const url = `${BASE_PATH}/${themeId}/metadata.json`

  try {
    const response = await fetch(url)
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.warn(`Failed to load metadata for "${themeId}":`, error)
    return null
  }
}

export async function loadTheme(themeId: string): Promise<Theme> {
  const manifest = await loadThemeManifest(themeId)
  const metadata = await loadThemeMetadata(themeId)

  return {
    id: themeId,
    manifest,
    metadata: metadata || undefined,
    basePath: `${BASE_PATH}/${themeId}`,
  }
}

export function getThemeList(): string[] {
  return [...AVAILABLE_THEMES]
}

export async function loadAllThemes(): Promise<Theme[]> {
  const themes: Theme[] = []

  for (const themeId of AVAILABLE_THEMES) {
    try {
      const theme = await loadTheme(themeId)
      themes.push(theme)
    } catch (error) {
      console.warn(`Skipping theme "${themeId}":`, error)
    }
  }

  return themes
}

export function getCharacterImageUrl(theme: Theme, character: Character): string {
  return `${theme.basePath}/${character.image}`
}

export function getPlaceholderImageUrl(): string {
  return PLACEHOLDER_IMAGE
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function selectRandomCharacters(
  characters: Character[],
  count: number
): Character[] {
  if (count > characters.length) {
    throw new Error(
      `Not enough characters: need ${count}, have ${characters.length}`
    )
  }
  const shuffled = shuffleArray(characters)
  return shuffled.slice(0, count)
}
