import { useApp } from '@/contexts/AppContext'
import { cn } from '@/lib/utils'

export function MarkerTools() {
  const { activeMarker, setActiveMarker } = useApp()

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-background/95 backdrop-blur-sm rounded-full shadow-lg border">
      <button
        type="button"
        onClick={() => setActiveMarker('x')}
        className={cn(
          'flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
          activeMarker === 'x'
            ? 'bg-red-500 text-white shadow-md scale-105 active:scale-100'
            : 'bg-muted hover:bg-red-100 text-red-600 active:scale-95'
        )}
      >
        <span className="text-xl font-bold">✕</span>
        <span className="text-sm font-medium">红方 (X)</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveMarker('o')}
        className={cn(
          'flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          activeMarker === 'o'
            ? 'bg-blue-500 text-white shadow-md scale-105 active:scale-100'
            : 'bg-muted hover:bg-blue-100 text-blue-600 active:scale-95'
        )}
      >
        <span className="text-xl font-bold">○</span>
        <span className="text-sm font-medium">蓝方 (O)</span>
      </button>
    </div>
  )
}
