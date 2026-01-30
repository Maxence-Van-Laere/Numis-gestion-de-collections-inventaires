import React, { useEffect, useState } from 'react'
import ObjectForm from '../components/ObjectForm'
import ObjectDetails from '../components/ObjectDetails'
import { useTheme } from '../contexts/ThemeContext'

export default function Collections({ selectedCollection }) {
  const [collections, setCollections] = useState([])
  const [selected, setSelected] = useState(selectedCollection || null)
  const [objects, setObjects] = useState([])
  const [allObjects, setAllObjects] = useState([])
  const [searchText, setSearchText] = useState('')
  const [selectedObject, setSelectedObject] = useState(null)
  const { theme, isDark } = useTheme()

  const colors = {
    light: {
      card: '#fff',
      text: '#2c3e50',
      textMuted: '#666',
      border: '#ddd',
      input: '#fff',
      shadow: '0 2px 8px rgba(0,0,0,0.06)'
    },
    dark: {
      card: '#2d3748',
      text: '#e2e8f0',
      textMuted: '#a0aec0',
      border: '#4a5568',
      input: '#1a202c',
      shadow: '0 2px 8px rgba(0,0,0,0.3)'
    }
  }

  const c = colors[theme]

  async function loadCollections() {
    try {
      const list = await window.api.listCollections()
      setCollections(list)
    } catch (err) {
      console.error('Erreur lors du chargement des collections:', err)
      setTimeout(loadCollections, 2000)
    }
  }

  async function selectCollection(c) {
    setSelected(c)
    const objs = await window.api.listObjects(c.id)
    setObjects(objs)
  }

  async function loadAllObjects() {
    try {
      const list = await window.api.listAllObjects()
      setAllObjects(list)
    } catch (err) {
      console.error('Erreur lors du chargement de tous les objets:', err)
    }
  }

  useEffect(() => { loadCollections() }, [])
  useEffect(() => { 
    if (selectedCollection) {
      selectCollection(selectedCollection)
    }
  }, [selectedCollection])
  useEffect(() => { if (!selected) loadAllObjects() }, [selected])

  const getPhotoSrc = (o) => {
    if (o.cheminPhoto) return `http://127.0.0.1:5555/files/${o.cheminPhoto}`
    if (o.photoBase64) return `data:image/png;base64,${o.photoBase64}`
    if (o.photo) return o.photo
    return null
  }

  function renderObjectsGrid(list, onDelete) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16,
        marginTop: 12
      }}>
        {list.map(o => {
          const photoSrc = getPhotoSrc(o)
          return (
            <div 
              key={o.id}
              onClick={() => setSelectedObject(o)}
              style={{
                background: c.card,
                borderRadius: 10,
                boxShadow: c.shadow,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: `1px solid ${c.border}`,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
              <div style={{
                height: 140,
                background: photoSrc ? `url(${photoSrc}) center/cover no-repeat` : 'linear-gradient(135deg,#dfe6e9,#b2bec3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#555',
                fontSize: 32,
                fontWeight: 700
              }}>
                {!photoSrc && (o.label?.[0]?.toUpperCase() || '?')}
              </div>
              <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontWeight: 700, color: c.text }}>{o.label}</div>
                <div style={{ color: c.textMuted, fontSize: 13, lineHeight: 1.4 }}>
                  {o.dateAcquisition ? new Date(o.dateAcquisition).toLocaleString() : 'Date inconnue'}
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => onDelete(o.id)} style={{
                    padding: '6px 10px',
                    background: '#d63031',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 12
                  }}>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ padding: 20 }}>
      <ObjectDetails 
        object={selectedObject}
        collections={collections}
        onClose={() => setSelectedObject(null)}
        onSave={async (payload) => {
          if (!selectedObject) return
          await window.api.updateObject(selectedObject.id, payload)
          await loadAllObjects()
          setSelectedObject(null)
        }}
      />

      <h1 style={{ marginTop: 0, marginBottom: 20, color: c.text }}>Objets de Collection</h1>

      {/* Sélecteur de collection */}
      <div style={{ 
        background: c.card, 
        padding: 20, 
        borderRadius: 8, 
        boxShadow: c.shadow,
        marginBottom: 20
      }}>
        <label style={{ display: 'block', marginBottom: 10, fontWeight: 600, color: c.text }}>
          Sélectionnez une collection :
        </label>
        <select
          value={selected?.id || ''}
          onChange={(e) => {
            const val = e.target.value
            if (val === '') {
              setSelected(null)
            } else {
              const col = collections.find(c => c.id === parseInt(val))
              if (col) selectCollection(col)
            }
          }}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: `1px solid ${c.border}`,
            borderRadius: 6,
            fontSize: 15,
            cursor: 'pointer',
            background: c.input,
            color: c.text
          }}
        >
          <option value="">-- Tous les objets --</option>
          {collections.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.count} objets)</option>
          ))}
        </select>
      </div>

      {/* Affichage des objets */}
      {selected ? (
        <ObjectForm 
          collection={selected} 
          collections={collections}
          objects={objects} 
          onCreate={async (obj) => { 
            await window.api.createObject(obj); 
            selectCollection(selected); 
          }} 
          onDelete={async (id) => { 
            await window.api.deleteObject(id); 
            selectCollection(selected); 
          }}
          onUpdate={async () => { await selectCollection(selected) }}
        />
      ) : (
        <div>
          {/* Section recherche et actions pour "Tous les objets" */}
          <div style={{ 
            background: c.card, 
            padding: 20, 
            borderRadius: 8, 
            boxShadow: c.shadow,
            marginBottom: 20 
          }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                placeholder="🔍 Rechercher un objet..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: `1px solid ${c.border}`,
                  borderRadius: 6,
                  fontSize: 14,
                  background: c.input,
                  color: c.text
                }}
              />
            </div>
          </div>

          <h4 style={{ color: c.text }}>Tous les objets</h4>
          {renderObjectsGrid(
            allObjects.filter(o => o.label?.toLowerCase().includes(searchText.toLowerCase())),
            async (id) => { 
              await window.api.deleteObject(id); 
              loadAllObjects(); 
            }
          )}
        </div>
      )}
    </div>
  )
}
