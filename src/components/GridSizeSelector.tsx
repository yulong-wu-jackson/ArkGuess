import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useApp } from '@/contexts/AppContext'

const GRID_SIZES = [2, 3, 4, 5, 6, 7] as const

export function GridSizeSelector() {
  const { selectedTheme, gridSize, setGridSize, requiredCharacterCount } = useApp()

  const maxCharacters = selectedTheme?.manifest.characters.length ?? 0

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-center">网格大小</h2>
      <div className="flex flex-col items-center gap-2">
        <Select
          value={gridSize.toString()}
          onValueChange={(value) => setGridSize(parseInt(value))}
        >
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="选择网格大小" />
          </SelectTrigger>
          <SelectContent>
            {GRID_SIZES.map((size) => {
              const required = size * size
              const disabled = required > maxCharacters
              return (
                <SelectItem
                  key={size}
                  value={size.toString()}
                  disabled={disabled}
                >
                  {size} × {size}
                  {disabled && ' (角色数量不足)'}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          需要 {requiredCharacterCount} 个角色
          {selectedTheme && maxCharacters < requiredCharacterCount && (
            <span className="text-destructive ml-2">
              (当前主题仅有 {maxCharacters} 个)
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
