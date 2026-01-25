import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { loadAllThemes, getCharacterImageUrl } from '@/lib/theme-loader'
import { useApp } from '@/contexts/AppContext'
import type { Theme } from '@/types'
import { cn } from '@/lib/utils'

export function ThemeSelector() {
  const { selectedTheme, setSelectedTheme } = useApp()
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAllThemes()
      .then((loadedThemes) => {
        setThemes(loadedThemes)
        if (loadedThemes.length === 1 && !selectedTheme) {
          setSelectedTheme(loadedThemes[0])
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [selectedTheme, setSelectedTheme])

  if (loading) {
    return (
      <div className="text-center text-muted-foreground">
        加载主题中...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-destructive">
        加载失败: {error}
      </div>
    )
  }

  if (themes.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        暂无可用主题
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-center">选择主题</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {themes.map((theme) => {
          const isSelected = selectedTheme?.id === theme.id
          const previewChar = theme.manifest.characters[0]

          return (
            <Card
              key={theme.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                isSelected && 'ring-2 ring-primary'
              )}
              onClick={() => setSelectedTheme(theme)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-3">
                  {previewChar && (
                    <img
                      src={getCharacterImageUrl(theme, previewChar)}
                      alt={previewChar.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  {theme.manifest.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  {theme.manifest.characters.length} 个角色
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
