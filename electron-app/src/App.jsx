import React, { useState } from 'react'
import Drawer from './components/Drawer'
import Home from './views/Home'
import Collections from './views/Collections'
import Utilisateur from './views/Utilisateur'

export default function App() {
  const [currentView, setCurrentView] = useState('home')
  const [drawerCollapsed, setDrawerCollapsed] = useState(false)

  function renderView() {
    switch (currentView) {
      case 'home':
        return <Home />
      case 'collections':
        return <Collections />
      case 'utilisateur':
        return <Utilisateur />
      default:
        return <Home />
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Segoe UI, Arial' }}>
      <Drawer 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        collapsed={drawerCollapsed}
        onToggleCollapse={() => setDrawerCollapsed(!drawerCollapsed)}
      />
      <div style={{ flex: 1, overflow: 'auto', background: '#f5f6fa' }}>
        {renderView()}
      </div>
    </div>
  )
}
