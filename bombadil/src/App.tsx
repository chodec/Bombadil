import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/ui/theme-provider"
import { ModeToggle } from "@/components/ui/mode-toggle"

import Login from './pages/auth/login'
import Register from './pages/auth/register'
import RoleSelection from './pages/auth/roleSelection'
import TrainerDashboard from './pages/trainer/trainerDashboard'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/role-selection" element={<RoleSelection />} />
          <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
          
          <Route path="/" element={
            <div className="flex min-h-svh flex-col items-center justify-center">
              <h1 className="text-5xl font-bold underline">
                Hello world!
              </h1>
              <ModeToggle />
            </div>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;