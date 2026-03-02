import React, { useState } from 'react'
import ObjectDetails from './ObjectDetails'
import { useTheme } from '../contexts/ThemeContext'

export default function ObjectForm({ collection, collections, objects, onCreate, onDelete, onUpdate }) {
  const [form, setForm] = useState({ label: '', cheminPhoto: '', commentaires: '', dateAcquisition: '', dateProduction: '', lieuAcquisition: '' })
  const [searchText, setSearchText] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [selectedObject, setSelectedObject] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [targetCollection, setTargetCollection] = useState(null)
  const [moving, setMoving] = useState(false)
  const [sortBy, setSortBy] = useState('dateAcquisition')
  const [sortOrder, setSortOrder] = useState('desc')
  const {theme, isDark } = useTheme()

  const colors = {
    light: {
      card: '#fff',
      text: '#2c3e50',
      textMuted: '#666',
      border: '#ddd',
      input: '#fff',
      buttonPrimary: '#4a5568',
      buttonSuccess: '#48bb78',
      buttonWarning: '#f39c12',
      buttonDanger: '#e53e3e',
      selected: '#e8f4f8',
      selectedBorder: '#4a5568'
    },
    dark: {
      card: '#2d3748',
      text: '#e2e8f0',
      textMuted: '#a0aec0',
      border: '#4a5568',
      input: '#1a202c',
      buttonPrimary: '#4a5568',
      buttonSuccess: '#48bb78',
      buttonWarning: '#f39c12',
      buttonDanger: '#e53e3e',
      selected: '#2c5282',
      selectedBorder: '#4a5568'
    }
  }

  const c = colors[theme]

  const getPhotoSrc = (o) => {
    // Utilise le chemin de fichier ou la base64
    if (o.cheminPhoto) return `http://127.0.0.1:5555/files/${o.cheminPhoto}`
    if (o.photoBase64) return `data:image/png;base64,${o.photoBase64}`
    if (o.photo) return o.photo
    return null
  }

  const getSortedObjects = (list) => {
    const sorted = [...list]
    sorted.sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]

      if (sortBy === 'label') {
        aVal = (aVal || '').toLowerCase()
        bVal = (bVal || '').toLowerCase()
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }

      if (sortBy === 'dateAcquisition' || sortBy === 'dateProduction') {
        aVal = new Date(aVal || 0).getTime()
        bVal = new Date(bVal || 0).getTime()
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }

      return 0
    })
    return sorted
  }

  const filteredObjects = getSortedObjects(
    objects.filter(o => o.label?.toLowerCase().includes(searchText.toLowerCase()))
  )

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const cancelEdit = () => {
    setEditMode(false)
    setSelectedIds(new Set())
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://127.0.0.1:5555/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload')
      }

      const data = await response.json()
      setForm(prev => ({ ...prev, cheminPhoto: data.path }))
    } catch (error) {
      console.error('Erreur upload:', error)
      alert('Erreur lors de l\'upload de l\'image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.label.trim()) {
      alert('Le champ "Label" est obligatoire !')
      return
    }
    
    const newObject = {
      // L'API C# attend camelCase : collectionId
      collectionId: collection.id,
      label: form.label,
      cheminPhoto: form.cheminPhoto || null,
      commentaires: form.commentaires || null,
      lieuAcquisition: form.lieuAcquisition?.trim() || null,
      dateAcquisition: form.dateAcquisition ? new Date(form.dateAcquisition).toISOString() : null,
      dateProduction: form.dateProduction ? new Date(form.dateProduction).toISOString() : null
    }
    
    await onCreate(newObject)
    setForm({ label: '', cheminPhoto: '', commentaires: '', dateAcquisition: '', dateProduction: '', lieuAcquisition: '' })
    setShowAddModal(false)
  }

  const handleMove = async () => {
    if (!targetCollection) {
      alert('Veuillez sélectionner une collection de destination')
      return
    }

    if (targetCollection.id === collection.id) {
      alert('Vous ne pouvez pas déplacer vers la même collection')
      return
    }

    setMoving(true)
    try {
      await window.api.moveObjects(Array.from(selectedIds), targetCollection.id)
      setShowMoveModal(false)
      setSelectedIds(new Set())
      setEditMode(false)
      setTargetCollection(null)
      if (onUpdate) await onUpdate()
    } catch (error) {
      console.error('Erreur lors du déplacement:', error)
      alert('Erreur lors du déplacement des objets')
    } finally {
      setMoving(false)
    }
  }

  return (
    <div>
      <ObjectDetails 
        object={selectedObject}
        collections={collections}
        onClose={() => setSelectedObject(null)}
        onSave={async (payload) => {
          if (!selectedObject) return
          await window.api.updateObject(selectedObject.id, payload)
          if (onUpdate) await onUpdate()
          setSelectedObject(null)
        }}
      />

      {/* Modal d'ajout */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: c.card,
            padding: 30,
            borderRadius: 12,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            width: '90%',
            maxWidth: 500
          }}>
            <h2 style={{ marginTop: 0, marginBottom: 20, color: c.text }}>Ajouter un nouvel objet</h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: c.text }}>
                  Label <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="Nom de l'objet (obligatoire)"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${c.border}`,
                    borderRadius: 6,
                    fontSize: 14,
                    boxSizing: 'border-box',
                    background: c.input,
                    color: c.text
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: c.text }}>
                  Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${c.border}`,
                    borderRadius: 6,
                    fontSize: 14,
                    boxSizing: 'border-box',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    background: c.input,
                    color: c.text
                  }}
                />
                {uploading && <div style={{ marginTop: 8, color: '#3498db', fontSize: 14 }}>Upload en cours...</div>}
                {form.cheminPhoto && (
                  <div style={{ marginTop: 8, fontSize: 14, color: '#27ae60' }}>
                    ✓ Image uploadée : {form.cheminPhoto}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: c.text }}>
                  Date d'acquisition
                </label>
                <input
                  type="date"
                  value={form.dateAcquisition}
                  onChange={(e) => setForm({ ...form, dateAcquisition: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${c.border}`,
                    borderRadius: 6,
                    fontSize: 14,
                    boxSizing: 'border-box',
                    background: c.input,
                    color: c.text
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: c.text }}>
                  Date de production
                </label>
                <input
                  type="date"
                  value={form.dateProduction}
                  onChange={(e) => setForm({ ...form, dateProduction: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${c.border}`,
                    borderRadius: 6,
                    fontSize: 14,
                    boxSizing: 'border-box',
                    background: c.input,
                    color: c.text
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: c.text }}>
                  Commentaires
                </label>
                <textarea
                  value={form.commentaires}
                  onChange={(e) => setForm({ ...form, commentaires: e.target.value })}
                  placeholder="Ajouter des commentaires (optionnel)"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${c.border}`,
                    borderRadius: 6,
                    fontSize: 14,
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    background: c.input,
                    color: c.text
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: c.text }}>
                  Lieu d'acquisition (ville)
                </label>
                <input
                  type="text"
                  value={form.lieuAcquisition}
                  onChange={(e) => setForm({ ...form, lieuAcquisition: e.target.value })}
                  placeholder="Ex: Paris"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${c.border}`,
                    borderRadius: 6,
                    fontSize: 14,
                    boxSizing: 'border-box',
                    background: c.input,
                    color: c.text
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setForm({ label: '', cheminPhoto: '', commentaires: '', dateAcquisition: '', dateProduction: '', lieuAcquisition: '' })
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#95a5a6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    background: c.buttonSuccess,
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
            </form>
          </div>
        </div>
      )}

      {/* Section recherche et actions */}
      <div style={{ 
        background: c.card, 
        padding: 20, 
        borderRadius: 8, 
        boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
        marginBottom: 20 
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            placeholder="🔍 Rechercher un objet..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{
              flex: '0 1 250px',
              padding: '10px 12px',
              border: `1px solid ${c.border}`,
              borderRadius: 6,
              fontSize: 14,
              background: c.input,
              color: c.text
            }}
          />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', whiteSpace: 'nowrap' }}>
            <label style={{ color: c.text, fontSize: 13, fontWeight: 600 }}>Trier par :</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                setSortOrder('asc')
              }}
              style={{
                padding: '8px 10px',
                border: `1px solid ${c.border}`,
                borderRadius: 6,
                fontSize: 13,
                cursor: 'pointer',
                background: c.input,
                color: c.text,
                whiteSpace: 'nowrap'
              }}
            >
              <option value="label">Nom</option>
              <option value="dateAcquisition">Date d'acquisition</option>
              <option value="dateProduction">Date de production</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              style={{
                padding: '8px 12px',
                border: `1px solid ${c.border}`,
                borderRadius: 6,
                background: c.input,
                color: c.text,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                minWidth: '100px',
                whiteSpace: 'nowrap'
              }}
            >
              {sortOrder === 'asc' ? '↑ Croissant' : '↓ Décroissant'}
            </button>
          </div>
          {!editMode && (
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: '10px 20px',
                background: c.buttonSuccess,
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}
            >
              Ajouter
            </button>
          )}
          <button
            onClick={() => editMode ? cancelEdit() : setEditMode(true)}
            style={{
              padding: '10px 20px',
              background: editMode ? c.buttonDanger : c.buttonPrimary,
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            {editMode ? 'Annuler' : 'Modifier'}
          </button>
          {editMode && (
            <>
              <button
                onClick={() => setShowMoveModal(true)}
                style={{
                  padding: '10px 20px',
                  background: c.buttonWarning,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Déplacer ({selectedIds.size})
              </button>
              <button
                onClick={() => {
                  selectedIds.forEach(id => onDelete(id))
                  setSelectedIds(new Set())
                }}
                style={{
                  padding: '10px 20px',
                  background: c.buttonDanger,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Supprimer ({selectedIds.size})
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <h4 style={{ color: c.text }}>Objets</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
          marginTop: 12
        }}>
          {filteredObjects.map(o => {
            const photoSrc = getPhotoSrc(o)
            const isSelected = selectedIds.has(o.id)
            return (
              <div 
                key={o.id} 
                onClick={() => {
                  if (editMode) {
                    toggleSelect(o.id)
                  } else {
                    setSelectedObject(o)
                  }
                }}
                style={{
                  background: isSelected ? c.selected : c.card,
                  borderRadius: 10,
                  boxShadow: isSelected ? `0 0 0 3px ${c.selectedBorder}` : (isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)'),
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  border: isSelected ? `2px solid ${c.selectedBorder}` : `1px solid ${c.border}`,
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
                  fontWeight: 700,
                  position: 'relative'
                }}>
                  {editMode && (
                    <div style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      width: 24,
                      height: 24,
                      background: isSelected ? '#3498db' : '#fff',
                      border: '2px solid #3498db',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 16,
                      fontWeight: 'bold'
                    }}>
                      {isSelected && '✓'}
                    </div>
                  )}
                  {!photoSrc && (o.label?.[0]?.toUpperCase() || '?')}
                </div>
                <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontWeight: 700, color: c.text }}>{o.label}</div>
                  <div style={{ color: c.textMuted, fontSize: 13, lineHeight: 1.4 }}>
                    {o.dateAcquisition ? new Date(o.dateAcquisition).toLocaleString() : 'Date inconnue'}
                  </div>
                  {!editMode && (
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
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal pour déplacer les objets */}
      {showMoveModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1002
        }}>
          <div style={{
            background: c.card,
            padding: 30,
            borderRadius: 12,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            width: '90%',
            maxWidth: 400
          }}>
            <h2 style={{ marginTop: 0, marginBottom: 20, color: c.text }}>Déplacer {selectedIds.size} objet(s)</h2>
            
            <label style={{ display: 'block', marginBottom: 10, fontWeight: 600, color: c.text }}>
              Sélectionnez une collection de destination :
            </label>
            <select
              value={targetCollection?.id || ''}
              onChange={(e) => {
                const col = collections.find(c => c.id === parseInt(e.target.value))
                setTargetCollection(col || null)
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${c.border}`,
                borderRadius: 6,
                fontSize: 15,
                cursor: 'pointer',
                marginBottom: 20,
                background: c.input,
                color: c.text
              }}
            >
              <option value="">-- Sélectionner une collection --</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowMoveModal(false)
                  setTargetCollection(null)
                }}
                disabled={moving}
                style={{
                  padding: '10px 20px',
                  background: '#95a5a6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: moving ? 'not-allowed' : 'pointer',
                  fontWeight: 600
                }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleMove}
                disabled={moving || !targetCollection}
                style={{
                  padding: '10px 20px',
                  background: '#f39c12',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: moving || !targetCollection ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  opacity: moving || !targetCollection ? 0.6 : 1
                }}
              >
                {moving ? 'Déplacement...' : 'Déplacer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
