import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

export default function Utilisateur() {
  const { theme, toggleTheme, isDark } = useTheme()

  const colors = {
    light: {
      card: '#fff',
      text: '#2c3e50',
      textMuted: '#666',
      border: '#ddd',
      button: '#4a5568'
    },
    dark: {
      card: '#2d3748',
      text: '#e2e8f0',
      textMuted: '#a0aec0',
      border: '#4a5568',
      button: '#4a5568'
    }
  }

  const c = colors[theme]

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 32, marginBottom: 30, color: c.text }}>Préférences</h1>

      <div style={{
        maxWidth: 600,
        background: c.card,
        padding: 30,
        borderRadius: 12,
        boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: 20, marginTop: 0, color: c.text }}>Apparence</h2>
        <div style={{ color: c.textMuted, lineHeight: 1.8 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '12px 0',
            borderTop: `1px solid ${c.border}`,
            marginTop: 12,
            paddingTop: 12
          }}>
            <span>🌙 Thème: {isDark ? 'Sombre' : 'Clair'}</span>
            <button
              onClick={toggleTheme}
              style={{
                padding: '8px 20px',
                background: c.button,
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              {isDark ? '☀️ Mode Clair' : '🌙 Mode Sombre'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
