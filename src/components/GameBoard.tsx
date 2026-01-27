import { CharacterCard } from '@/components/CharacterCard'
import type { Theme, CellState, MarkerType } from '@/types'

interface GameBoardProps {
  cells: CellState[]
  theme: Theme
  gridSize: number
  activeMarker: MarkerType
  onCellClick?: (index: number) => void
}

export function GameBoard({
  cells,
  theme,
  gridSize,
  activeMarker,
  onCellClick,
}: GameBoardProps) {
  return (
    <div className="w-full max-w-[800px] mx-auto">
      <div
        className="grid gap-1 sm:gap-2"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {cells.map((cell, index) => (
          <CharacterCard
            key={index}
            character={cell.character}
            theme={theme}
            markers={cell.markers}
            activeMarker={activeMarker}
            onClick={onCellClick ? () => onCellClick(index) : undefined}
          />
        ))}
      </div>
    </div>
  )
}
