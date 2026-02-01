import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'

export default function CollectionList({ collections, onCreate, onSelect, onDelete }) {
  const [name, setName] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const { theme, isDark } = useTheme()

  const colors = {
    light: {
      card: '#fff',
      text: '#2c3e50',
      textMuted: '#666',
      border: '#ddd',
      tableHeader: '#f7f9fb',
      tableRow: '#fbfcfd',
      input: '#fff',
      buttonPrimary: '#4a5568',
      buttonDanger: '#dc3545',
      link: '#2c5282'
    },
    dark: {
      card: '#2d3748',
      text: '#e2e8f0',
      textMuted: '#a0aec0',
      border: '#4a5568',
      tableHeader: '#1a202c',
      tableRow: '#2d3748',
      input: '#1a202c',
      buttonPrimary: '#4a5568',
      buttonDanger: '#dc3545',
      link: '#63b3ed'
    }
  }

  const c = colors[theme]

  function fmt(dateStr) {
    if (!dateStr) return '-'
    try { return new Date(dateStr).toLocaleString() } catch (e) { return dateStr }
  }

  function getSortedCollections() {
    const sorted = [...collections]
    sorted.sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]

      if (sortBy === 'name') {
        aVal = (aVal || '').toLowerCase()
        bVal = (bVal || '').toLowerCase()
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }

      if (sortBy === 'count') {
        aVal = a.count || 0
        bVal = b.count || 0
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }

      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aVal = new Date(aVal || 0).getTime()
        bVal = new Date(bVal || 0).getTime()
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }

      return 0
    })
    return sorted
  }

  function handleColumnSort(column) {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  function getSortIndicator(column) {
    if (sortBy !== column) return ' ↑↓'
    return sortOrder === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <div style={{ background: c.card, borderRadius: 8, boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0, color: c.text }}>Collections</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input 
            placeholder="Nouvelle collection" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            style={{ 
              padding: '6px 8px', 
              borderRadius: 6, 
              border: `1px solid ${c.border}`,
              background: c.input,
              color: c.text
            }} 
          />
          <button 
            onClick={() => { if (name.trim()) { onCreate(name.trim()); setName('') } }} 
            style={{ 
              padding: '6px 12px', 
              background: c.buttonPrimary, 
              color: '#fff', 
              border: 'none', 
              borderRadius: 6, 
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Créer
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ background: c.tableHeader }}>
              <th 
                onClick={() => handleColumnSort('name')}
                style={{ textAlign: 'left', padding: '10px 12px', fontSize: 13, color: c.text, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
              >
                Nom{getSortIndicator('name')}
              </th>
              <th 
                onClick={() => handleColumnSort('count')}
                style={{ textAlign: 'right', padding: '10px 12px', fontSize: 13, color: c.text, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
              >
                Nb éléments{getSortIndicator('count')}
              </th>
              <th 
                onClick={() => handleColumnSort('created_at')}
                style={{ textAlign: 'left', padding: '10px 12px', fontSize: 13, color: c.text, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
              >
                Date création{getSortIndicator('created_at')}
              </th>
              <th 
                onClick={() => handleColumnSort('updated_at')}
                style={{ textAlign: 'left', padding: '10px 12px', fontSize: 13, color: c.text, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
              >
                Dernière modification{getSortIndicator('updated_at')}
              </th>
              <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: 13, color: c.text, whiteSpace: 'nowrap' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getSortedCollections().map((col, i) => (
              <tr key={col.id} style={{ background: i % 2 === 0 ? c.card : c.tableRow, borderTop: `1px solid ${c.border}` }}>
                <td style={{ padding: '10px 12px' }}>
                  <button onClick={() => onSelect(col)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: c.link, fontWeight: 600 }}>{col.name}</button>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: c.text }}>{col.count || 0}</td>
                <td style={{ padding: '10px 12px', color: c.textMuted }}>{fmt(col.created_at)}</td>
                <td style={{ padding: '10px 12px', color: c.textMuted }}>{fmt(col.updated_at)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <button onClick={() => onDelete && onDelete(col.id)} style={{ padding: '4px 10px', background: c.buttonDanger, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
