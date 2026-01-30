import React, { useState } from 'react'
import Drawer from './components/Drawer'
import Home from './views/Home'
import Collections from './views/Collections'
import Utilisateur from './views/Utilisateur'
import { useTheme } from './contexts/ThemeContext'


export default function App() {
  const [currentView, setCurrentView] = useState('home')
  const [drawerCollapsed, setDrawerCollapsed] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState(null)
  const { theme } = useTheme()

  const colors = {
    light: {
      background: '#f7fafc',
      text: '#2c3e50'
    },
    dark: {
      background: '#1a202c',
      text: '#e2e8f0'
    }
  }

  const currentColors = colors[theme]

  function renderView() {
    switch (currentView) {
      case 'home':
        return <Home onSelectCollection={(collection) => { 
          setSelectedCollection(collection)
          setCurrentView('collections')
        }} />
      case 'collections':
        return <Collections selectedCollection={selectedCollection} />
      case 'preferences':
        return <Utilisateur />
      default:
        return <Home onSelectCollection={(collection) => { 
          setSelectedCollection(collection)
          setCurrentView('collections')
        }} />
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      fontFamily: 'Segoe UI, Arial',
      background: currentColors.background,
      color: currentColors.text
    }}>
      <Drawer 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        collapsed={drawerCollapsed}
        onToggleCollapse={() => setDrawerCollapsed(!drawerCollapsed)}
      />
      <div style={{ 
        flex: 1, 
        overflow: 'auto', 
        background: currentColors.background,
        color: currentColors.text
      }}>
        {renderView()}
      </div>
    </div>
  )
}
