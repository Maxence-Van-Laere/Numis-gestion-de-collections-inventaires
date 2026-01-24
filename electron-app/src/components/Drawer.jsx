import React from 'react'

export default function Drawer({ currentView, onNavigate, collapsed, onToggleCollapse }) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'collections', label: 'Collections', icon: '📚' },
    { id: 'utilisateur', label: 'Utilisateur', icon: '👤' }
  ]

  return (
    <div style={{
      width: collapsed ? 70 : 240,
      background: '#2c3e50',
      color: '#ecf0f1',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
      transition: 'width 0.3s ease'
    }}>
      <div style={{
        padding: collapsed ? '15px 10px' : '15px 20px',
        borderBottom: '1px solid #34495e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 10
      }}>
        <div style={{
          fontSize: 20,
          fontWeight: 'bold',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}>
          {collapsed ? '' : 'Collections'}
        </div>
        <button
          onClick={onToggleCollapse}
          style={{
            padding: '5px 8px',
            background: '#34495e',
            color: '#ecf0f1',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 20,
            transition: 'background 0.2s',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => e.target.style.background = '#4a5f7f'}
          onMouseLeave={(e) => e.target.style.background = '#34495e'}
          title={collapsed ? 'Agrandir' : 'Réduire'}
        >
          ☰
        </button>
      </div>

      <nav style={{ flex: 1, padding: '10px 0' }}>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            title={collapsed ? item.label : ''}
            style={{
              width: '100%',
              padding: '15px 20px',
              background: currentView === item.id ? '#34495e' : 'transparent',
              color: '#ecf0f1',
              border: 'none',
              borderLeft: currentView === item.id ? '4px solid #3498db' : '4px solid transparent',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transition: 'all 0.2s',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (currentView !== item.id) {
                e.target.style.background = '#34495e50'
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== item.id) {
                e.target.style.background = 'transparent'
              }
            }}
          >
            <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
            <span style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div style={{
        padding: collapsed ? '20px 10px' : 20,
        fontSize: 12,
        color: '#95a5a6',
        borderTop: '1px solid #34495e',
        textAlign: 'center',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
      }}>
        {collapsed ? 'v1' : 'v1.0.0'}
      </div>
    </div>
  )
}
