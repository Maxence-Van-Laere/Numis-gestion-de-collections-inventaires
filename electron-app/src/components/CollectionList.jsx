import React, { useState } from 'react'

export default function CollectionList({ collections, onCreate, onSelect, onDelete }) {
  const [name, setName] = useState('')

  function fmt(dateStr) {
    if (!dateStr) return '-'
    try { return new Date(dateStr).toLocaleString() } catch (e) { return dateStr }
  }

  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Collections</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input placeholder="Nouvelle collection" value={name} onChange={e => setName(e.target.value)} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd' }} />
          <button onClick={() => { if (name.trim()) { onCreate(name.trim()); setName('') } }} style={{ padding: '6px 12px', background: '#007acc', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Créer</button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: '#f7f9fb' }}>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 13, color: '#333' }}>Nom</th>
              <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 13, color: '#333' }}>Nb éléments</th>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 13, color: '#333' }}>Date création</th>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 13, color: '#333' }}>Dernière modification</th>
              <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: 13, color: '#333' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((c, i) => (
              <tr key={c.id} style={{ background: i % 2 === 0 ? '#fff' : '#fbfcfd', borderTop: '1px solid #eee' }}>
                <td style={{ padding: '10px 12px' }}>
                  <button onClick={() => onSelect(c)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#007acc', fontWeight: 600 }}>{c.name}</button>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: '#333' }}>{c.count || 0}</td>
                <td style={{ padding: '10px 12px', color: '#666' }}>{fmt(c.created_at)}</td>
                <td style={{ padding: '10px 12px', color: '#666' }}>{fmt(c.updated_at)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <button onClick={() => onDelete && onDelete(c.id)} style={{ padding: '4px 10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
