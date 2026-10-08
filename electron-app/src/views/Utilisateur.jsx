import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

export default function Utilisateur() {
  const { theme, toggleTheme, isDark } = useTheme()

  async function exportDatabase() {
    try {
      const data = await window.api.exportDatabase()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = `numis-export-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur lors de l\'export de la base de données:', error)
      window.alert('Impossible d\'exporter la base de données.')
    }
  }

  async function importDatabase(event, mode) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    const confirmation = mode === 'replace'
      ? 'Cette action remplacera les collections et les objets actuels. Continuer ?'
      : 'Cette action conservera les données actuelles et fusionnera l\'export avec elles. Continuer ?'

    if (!window.confirm(confirmation)) {
      return
    }

    try {
      const data = JSON.parse(await file.text())
      const result = await window.api.importDatabase(data, mode)
      const action = mode === 'replace' ? 'Remplacement' : 'Fusion'
      window.alert(`${action} terminé : ${result.collections} collection(s) et ${result.objects} objet(s) traitée(s).`)
      window.location.reload()
    } catch (error) {
      console.error('Erreur lors de l\'import de la base de données:', error)
      window.alert('Impossible d\'importer ce fichier JSON.')
    }
  }

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

        <h2 style={{ fontSize: 20, marginBottom: 12, color: c.text }}>Données</h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '12px 0',
          borderTop: `1px solid ${c.border}`
        }}>
          <span style={{ color: c.textMuted }}>Exporter les collections et les objets au format JSON</span>
          <button
            onClick={exportDatabase}
            style={{
              padding: '8px 20px',
              background: c.button,
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              cursor: 'pointer',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            Exporter
          </button>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '12px 0',
          borderTop: `1px solid ${c.border}`
        }}>
          <span style={{ color: c.textMuted }}>Importer un export JSON</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <label style={{
              padding: '8px 16px',
              background: c.button,
              color: '#fff',
              borderRadius: 6,
              fontSize: 14,
              cursor: 'pointer',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}>
              Remplacer
              <input
                type="file"
                accept="application/json,.json"
                onChange={(event) => importDatabase(event, 'replace')}
                style={{ display: 'none' }}
              />
            </label>
            <label style={{
              padding: '8px 16px',
              background: c.button,
              color: '#fff',
              borderRadius: 6,
              fontSize: 14,
              cursor: 'pointer',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}>
              Fusionner
              <input
                type="file"
                accept="application/json,.json"
                onChange={(event) => importDatabase(event, 'merge')}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
