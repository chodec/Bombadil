import { ThemeProvider } from "@/components/ui/theme-provider"
import { Button } from "@/components/ui/button"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <h1 className="text-5xl font-bold underline">
        Hello world!
      </h1>
      <div className="flex min-h-svh flex-col items-center justify-center">
        <Button>Click me</Button>
      </div>
    </ThemeProvider>

  );
}

export default App;
