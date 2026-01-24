const { contextBridge } = require('electron');

const API_BASE = process.env.CSHARP_BACKEND_URL || 'http://127.0.0.1:5555';

async function req(path, opts) {
  const res = await fetch(API_BASE + path, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts));
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.status === 204 ? null : await res.json();
}

contextBridge.exposeInMainWorld('api', {
  listCollections: () => req('/collections'),
  createCollection: (name) => req('/collections', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteCollection: (id) => fetch(API_BASE + `/collections/${id}`, { method: 'DELETE' }).then(r => { if (!r.ok) throw new Error('Delete failed') }),
  listObjects: (collectionId) => req(`/collections/${collectionId}/objects`),
  listAllObjects: () => req('/objects'),
  createObject: (obj) => req('/objects', { method: 'POST', body: JSON.stringify(obj) }),
  updateObject: (id, obj) => req(`/objects/${id}`, { method: 'PUT', body: JSON.stringify(obj) }),
  deleteObject: (id) => fetch(API_BASE + `/objects/${id}`, { method: 'DELETE' }).then(r => { if (!r.ok) throw new Error('Delete failed') })
});
