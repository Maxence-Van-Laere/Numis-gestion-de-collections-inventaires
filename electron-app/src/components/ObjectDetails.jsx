import React, { useEffect, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'

export default function ObjectDetails({ object, collections, onClose, onSave }) {
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ label: '', cheminPhoto: '', dateProduction: '', dateAcquisition: '', lieuAcquisition: '', commentaires: '' })
  const [uploading, setUploading] = useState(false)
  const { theme, isDark } = useTheme()

  const colors = {
    light: {
      card: '#fff',
      text: '#2c3e50',
      textMuted: '#666',
      border: '#ddd',
      input: '#fff',
      readonlyBg: '#f5f5f5',
      buttonPrimary: '#4a5568',
      buttonSuccess: '#48bb78',
      buttonCancel: '#95a5a6'
    },
    dark: {
      card: '#2d3748',
      text: '#e2e8f0',
      textMuted: '#a0aec0',
      border: '#4a5568',
      input: '#1a202c',
      readonlyBg: '#1a202c',
      buttonPrimary: '#4a5568',
      buttonSuccess: '#48bb78',
      buttonCancel: '#718096'
    }
  }

  const c = colors[theme]

  useEffect(() => {
    if (object) {
      setForm({
        label: object.label || '',
        cheminPhoto: object.cheminPhoto || '',
        dateProduction: object.dateProduction ? object.dateProduction.substring(0, 10) : '',
        dateAcquisition: object.dateAcquisition ? object.dateAcquisition.substring(0, 10) : '',
        lieuAcquisition: object.lieuAcquisition || '',
        commentaires: object.commentaires || ''
      })
      setEditMode(false)
    }
  }, [object])

  if (!object) return null

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

  const handleSave = async () => {
    if (!form.label.trim()) {
      alert('Le label est obligatoire')
      return
    }
    const payload = {
      label: form.label.trim(),
      cheminPhoto: form.cheminPhoto || null,
      dateProduction: form.dateProduction ? new Date(form.dateProduction).toISOString() : null,
      dateAcquisition: form.dateAcquisition ? new Date(form.dateAcquisition).toISOString() : null,
      lieuAcquisition: form.lieuAcquisition?.trim() || null,
      commentaires: form.commentaires || null
    }
    if (onSave) await onSave(payload)
    setEditMode(false)
  }

  return (
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
      zIndex: 1001
    }}>
      <div style={{
        background: c.card,
        padding: 30,
        borderRadius: 12,
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        width: '90%',
        maxWidth: 600,
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ marginTop: 0, color: c.text }}>{editMode ? 'Éditer l\'objet' : object.label}</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            {!editMode && (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                style={{
                  padding: '8px 14px',
                  background: c.buttonPrimary,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Éditer
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setEditMode(false)
                onClose()
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                color: '#999'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Photo */}
        {(object.cheminPhoto || object.photoBase64) && (
          <div style={{ marginBottom: 20 }}>
            <img 
              src={object.cheminPhoto ? `http://127.0.0.1:5555/files/${object.cheminPhoto}` : `data:image/png;base64,${object.photoBase64}`}
              alt={object.label}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: 8,
                objectFit: 'cover',
                maxHeight: 300
              }}
            />
          </div>
        )}

        <div style={{
          display: 'grid',
          gap: 16
        }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: c.textMuted, marginBottom: 6 }}>Label</label>
            {editMode ? (
              <input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: `1px solid ${c.border}`, borderRadius: 6, background: c.input, color: c.text }}
              />
            ) : (
              <div style={{ padding: '10px 12px', background: c.readonlyBg, borderRadius: 6, color: c.text }}>
                {object.label}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, color: c.textMuted, marginBottom: 6 }}>Photo</label>
            {editMode ? (
              <div>
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
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    background: c.input,
                    color: c.text
                  }}
                />
                {uploading && <div style={{ marginTop: 8, color: '#3498db', fontSize: 14 }}>Upload en cours...</div>}
                {form.cheminPhoto && (
                  <div style={{ marginTop: 8, fontSize: 14, color: c.textMuted }}>
                    Fichier actuel : {form.cheminPhoto}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '10px 12px', background: c.readonlyBg, borderRadius: 6, color: c.text, wordBreak: 'break-word' }}>
                {object.cheminPhoto || '—'}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, color: c.textMuted, marginBottom: 6 }}>Date de production</label>
            {editMode ? (
              <input
                type="date"
                value={form.dateProduction}
                onChange={(e) => setForm({ ...form, dateProduction: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: `1px solid ${c.border}`, borderRadius: 6, background: c.input, color: c.text }}
              />
            ) : (
              <div style={{ padding: '10px 12px', background: c.readonlyBg, borderRadius: 6, color: c.text }}>
                {object.dateProduction ? new Date(object.dateProduction).toLocaleString() : '—'}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, color: c.textMuted, marginBottom: 6 }}>Date d'acquisition</label>
            {editMode ? (
              <input
                type="date"
                value={form.dateAcquisition}
                onChange={(e) => setForm({ ...form, dateAcquisition: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: `1px solid ${c.border}`, borderRadius: 6, background: c.input, color: c.text }}
              />
            ) : (
              <div style={{ padding: '10px 12px', background: c.readonlyBg, borderRadius: 6, color: c.text }}>
                {object.dateAcquisition ? new Date(object.dateAcquisition).toLocaleString() : '—'}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, color: c.textMuted, marginBottom: 6 }}>Lieu d'acquisition</label>
            {editMode ? (
              <input
                type="text"
                value={form.lieuAcquisition}
                onChange={(e) => setForm({ ...form, lieuAcquisition: e.target.value })}
                placeholder="Ex: Paris"
                style={{ width: '100%', padding: '10px 12px', border: `1px solid ${c.border}`, borderRadius: 6, background: c.input, color: c.text }}
              />
            ) : (
              <div style={{ padding: '10px 12px', background: c.readonlyBg, borderRadius: 6, color: c.text }}>
                {object.lieuAcquisition || '—'}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, color: c.textMuted, marginBottom: 6 }}>Commentaires</label>
            {editMode ? (
              <textarea
                value={form.commentaires}
                onChange={(e) => setForm({ ...form, commentaires: e.target.value })}
                rows={4}
                style={{ width: '100%', padding: '10px 12px', border: `1px solid ${c.border}`, borderRadius: 6, resize: 'vertical', background: c.input, color: c.text }}
              />
            ) : (
              <div style={{ padding: '10px 12px', background: c.readonlyBg, borderRadius: 6, color: c.text, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                {object.commentaires || '—'}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, color: c.textMuted, marginBottom: 6 }}>Catégorie</label>
            <div style={{ padding: '10px 12px', background: c.readonlyBg, borderRadius: 6, color: c.text }}>
              {collections?.find(c => c.id === object.categorieId)?.name || 'Pas de catégorie'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 30 }}>
          {editMode ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditMode(false)
                  setForm({
                    label: object.label || '',
                    cheminPhoto: object.cheminPhoto || '',
                    dateProduction: object.dateProduction ? object.dateProduction.substring(0, 10) : '',
                    dateAcquisition: object.dateAcquisition ? object.dateAcquisition.substring(0, 10) : '',
                    lieuAcquisition: object.lieuAcquisition || '',
                    commentaires: object.commentaires || ''
                  })
                }}
                style={{
                  padding: '10px 20px',
                  background: c.buttonCancel,
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
                type="button"
                onClick={handleSave}
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
                Enregistrer
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: c.buttonCancel,
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Fermer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
