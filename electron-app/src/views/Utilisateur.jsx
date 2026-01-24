import React, { useState } from 'react'

export default function Utilisateur() {
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 32, marginBottom: 30 }}>Profil Utilisateur</h1>

      <div style={{
        maxWidth: 600,
        background: '#fff',
        padding: 30,
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>
            Nom complet
          </label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Votre nom"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: 6,
              fontSize: 15
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre.email@exemple.com"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: 6,
              fontSize: 15
            }}
          />
        </div>

        <button
          onClick={() => alert('Profil sauvegardé !')}
          style={{
            padding: '10px 24px',
            background: '#3498db',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 15,
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          💾 Sauvegarder
        </button>
      </div>

      <div style={{
        marginTop: 40,
        maxWidth: 600,
        background: '#fff',
        padding: 30,
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: 20, marginTop: 0 }}>Paramètres</h2>
        <div style={{ color: '#666', lineHeight: 1.8 }}>
          <p>🔔 Notifications: Activées</p>
          <p>🌙 Thème: Clair</p>
          <p>💾 Sauvegarde automatique: Activée</p>
        </div>
      </div>
    </div>
  )
}
