import { Button } from '@/components/ui/button'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">ArkGuess 猜猜我是谁</h1>
      <p className="text-muted-foreground mb-6">项目初始化中...</p>
      <Button>开始游戏</Button>
    </div>
  )
}

export default App
