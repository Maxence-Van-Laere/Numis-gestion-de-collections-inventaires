import React, { useEffect, useState } from 'react'
import CollectionList from '../components/CollectionList'

export default function Home() {
  const [collections, setCollections] = useState([])

  async function loadCollections() {
    try {
      const list = await window.api.listCollections()
      setCollections(list)
    } catch (err) {
      console.error('Erreur lors du chargement des collections:', err)
      setTimeout(loadCollections, 2000)
    }
  }

  useEffect(() => { loadCollections() }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginTop: 0, marginBottom: 20 }}>Tableau de bord - Collections</h1>
      
      <CollectionList 
        collections={collections} 
        onCreate={async (name) => { 
          await window.api.createCollection(name); 
          await loadCollections(); 
        }} 
        onSelect={(c) => {
          // Navigation vers la page Collections sera gérée plus tard
          console.log('Collection sélectionnée:', c)
        }}
        onDelete={async (id) => { 
          if (window.confirm('Êtes-vous sûr de vouloir supprimer cette collection ?')) {
            await window.api.deleteCollection(id); 
            await loadCollections();
          }
        }}
      />
    </div>
  )
}
