import React, { useState } from 'react'
import Drawer from './components/Drawer'
import Home from './views/Home'
import Collections from './views/Collections'
import Utilisateur from './views/Utilisateur'
import Carte from './views/Carte'
import { useTheme } from './contexts/ThemeContext'

export default function App() {
  const [currentView, setCurrentView] = useState('home')
  const [drawerCollapsed, setDrawerCollapsed] = useState(false)
  const { theme } = useTheme()

  const colors = {
    light: {
      background: '#f5f6fa',
      text: '#2c3e50'
    },
    dark: {
      background: '#1a202c',
      text: '#e2e8f0'
    }
  }

  const c = colors[theme]

  function renderView() {
    switch (currentView) {
      case 'home':
        return <Home />
      case 'collections':
        return <Collections />
      case 'preferences':
      case 'utilisateur':
        return <Utilisateur />
      case 'carte':
        return <Carte />
      default:
        return <Home />
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Segoe UI, Arial', background: c.background, color: c.text }}>
      <Drawer 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        collapsed={drawerCollapsed}
        onToggleCollapse={() => setDrawerCollapsed(!drawerCollapsed)}
      />
      <div style={{ flex: 1, overflow: 'auto', background: c.background, color: c.text }}>
        {renderView()}
      </div>
    </div>
  )
}
