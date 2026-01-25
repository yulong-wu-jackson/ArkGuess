import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { loadTheme, getCharacterImageUrl, getPlaceholderImageUrl } from '@/lib/theme-loader'
import type { Theme, Character } from '@/types'

function App() {
  const [theme, setTheme] = useState<Theme | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sampleCharacters, setSampleCharacters] = useState<Character[]>([])

  useEffect(() => {
    loadTheme('arknights')
      .then((loadedTheme) => {
        setTheme(loadedTheme)
        setSampleCharacters(loadedTheme.manifest.characters.slice(0, 4))
      })
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">ArkGuess 猜猜我是谁</h1>

      {error ? (
        <p className="text-destructive mb-4">{error}</p>
      ) : theme ? (
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            主题: {theme.manifest.name} ({theme.manifest.characters.length} 个角色)
          </p>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {sampleCharacters.map((char) => (
              <div key={char.id} className="flex flex-col items-center">
                <img
                  src={getCharacterImageUrl(theme, char)}
                  alt={char.name}
                  className="w-16 h-16 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.src = getPlaceholderImageUrl()
                  }}
                />
                <span className="text-sm mt-1">{char.name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground mb-6">加载中...</p>
      )}

      <Button>开始游戏</Button>
    </div>
  )
}

export default App
