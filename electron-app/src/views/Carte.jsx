import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { useTheme } from '../contexts/ThemeContext'

const CACHE_KEY = 'geo-city-cache-v1'
const WORLD_CENTER = [20, 0]
const WORLD_ZOOM = 2
const GEOCODE_DELAY_MS = 1100

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
	iconRetinaUrl: markerIcon2x,
	iconUrl: markerIcon,
	shadowUrl: markerShadow
})

function normalizeCity(city) {
	return (city || '').trim().toLowerCase()
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

function loadCache() {
	try {
		const raw = localStorage.getItem(CACHE_KEY)
		if (!raw) return {}
		const parsed = JSON.parse(raw)
		return parsed && typeof parsed === 'object' ? parsed : {}
	} catch {
		return {}
	}
}

function saveCache(cacheObj) {
	localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj))
}

async function geocodeCity(city) {
	const q = encodeURIComponent(city)
	const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`
	const response = await fetch(url)

	if (!response.ok) {
		throw new Error(`Échec géocodage (${response.status}) pour ${city}`)
	}

	const data = await response.json()
	if (!Array.isArray(data) || data.length === 0) return null

	const first = data[0]
	const lat = Number(first.lat)
	const lon = Number(first.lon)
	if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null

	return {
		lat,
		lon,
		displayName: first.display_name || city
	}
}

export default function Carte() {
	const [objects, setObjects] = useState([])
	const [markers, setMarkers] = useState([])
	const [loading, setLoading] = useState(true)
	const [loadingText, setLoadingText] = useState('Chargement des objets...')
	const [error, setError] = useState('')
	const { theme } = useTheme()

	const colors = {
		light: {
			text: '#2c3e50',
			card: '#fff',
			border: '#ddd',
			muted: '#666'
		},
		dark: {
			text: '#e2e8f0',
			card: '#2d3748',
			border: '#4a5568',
			muted: '#a0aec0'
		}
	}

	const c = colors[theme]

	useEffect(() => {
		let cancelled = false

		async function run() {
			setLoading(true)
			setError('')

			try {
				setLoadingText('Chargement des objets...')
				const all = await window.api.listAllObjects()
				if (cancelled) return

				setObjects(all)

				const withCity = all.filter(o => normalizeCity(o.lieuAcquisition).length > 0)
				if (withCity.length === 0) {
					setMarkers([])
					return
				}

				const grouped = withCity.reduce((acc, obj) => {
					const key = normalizeCity(obj.lieuAcquisition)
					if (!acc[key]) {
						acc[key] = {
							key,
							cityLabel: obj.lieuAcquisition.trim(),
							items: []
						}
					}
					acc[key].items.push(obj)
					return acc
				}, {})

				const cityGroups = Object.values(grouped)
				const cache = loadCache()

				const nextMarkers = []
				for (let i = 0; i < cityGroups.length; i += 1) {
					const group = cityGroups[i]
					const cacheHit = cache[group.key]

					setLoadingText(`Géocodage ${i + 1}/${cityGroups.length} : ${group.cityLabel}`)

					if (cacheHit && Number.isFinite(cacheHit.lat) && Number.isFinite(cacheHit.lon)) {
						nextMarkers.push({
							cityKey: group.key,
							cityLabel: group.cityLabel,
							lat: cacheHit.lat,
							lon: cacheHit.lon,
							displayName: cacheHit.displayName || group.cityLabel,
							objects: group.items
						})
						continue
					}

					try {
						const geo = await geocodeCity(group.cityLabel)
						if (geo) {
							cache[group.key] = {
								lat: geo.lat,
								lon: geo.lon,
								displayName: geo.displayName,
								updatedAt: new Date().toISOString()
							}

							nextMarkers.push({
								cityKey: group.key,
								cityLabel: group.cityLabel,
								lat: geo.lat,
								lon: geo.lon,
								displayName: geo.displayName,
								objects: group.items
							})
						}
					} catch (e) {
						console.error(`Erreur géocodage pour ${group.cityLabel}:`, e)
					}

					if (i < cityGroups.length - 1) {
						await sleep(GEOCODE_DELAY_MS)
					}
				}

				if (cancelled) return
				saveCache(cache)
				setMarkers(nextMarkers)
			} catch (e) {
				console.error('Erreur carte:', e)
				if (!cancelled) setError('Impossible de charger la carte pour le moment.')
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		run()
		return () => {
			cancelled = true
		}
	}, [])

	const stats = useMemo(() => {
		const total = objects.length
		const withCity = objects.filter(o => normalizeCity(o.lieuAcquisition)).length
		return {
			total,
			withCity,
			cities: markers.length
		}
	}, [objects, markers])

	return (
		<div style={{ padding: 20 }}>
			<h1 style={{ marginTop: 0, marginBottom: 16, color: c.text }}>Carte des acquisitions</h1>

			<div style={{
				background: c.card,
				border: `1px solid ${c.border}`,
				borderRadius: 8,
				padding: 12,
				marginBottom: 12,
				color: c.text,
				display: 'flex',
				gap: 16,
				flexWrap: 'wrap'
			}}>
				<span><strong>Objets:</strong> {stats.total}</span>
				<span><strong>Avec ville:</strong> {stats.withCity}</span>
				<span><strong>Villes géocodées:</strong> {stats.cities}</span>
			</div>

			{loading && (
				<div style={{ marginBottom: 12, color: c.muted }}>{loadingText}</div>
			)}

			{error && (
				<div style={{ marginBottom: 12, color: '#e53e3e' }}>{error}</div>
			)}

			<div style={{
				height: 'calc(100vh - 220px)',
				minHeight: 420,
				borderRadius: 8,
				overflow: 'hidden',
				border: `1px solid ${c.border}`
			}}>
				<MapContainer center={WORLD_CENTER} zoom={WORLD_ZOOM} style={{ height: '100%', width: '100%' }}>
					<TileLayer
						attribution='&copy; OpenStreetMap contributors'
						url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
					/>

					{markers.map(marker => (
						<Marker key={marker.cityKey} position={[marker.lat, marker.lon]}>
							<Popup>
								<div style={{ minWidth: 220 }}>
									<div style={{ fontWeight: 700, marginBottom: 6 }}>{marker.cityLabel}</div>
									<div style={{ fontSize: 12, marginBottom: 8 }}>{marker.displayName}</div>
									<div style={{ fontSize: 13, marginBottom: 4 }}><strong>Objets:</strong> {marker.objects.length}</div>
									<ul style={{ margin: 0, paddingLeft: 16, maxHeight: 120, overflowY: 'auto' }}>
										{marker.objects.map(obj => (
											<li key={obj.id}>{obj.label || `Objet #${obj.id}`}</li>
										))}
									</ul>
								</div>
							</Popup>
						</Marker>
					))}
				</MapContainer>
			</div>
		</div>
	)
}
