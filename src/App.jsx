import { useEffect, useMemo, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'

const USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'

function magnitudeColor(mag) {
  if (mag >= 6) return '#ff1f1f'
  if (mag >= 5) return '#ff6a1f'
  if (mag >= 4) return '#ffb21f'
  if (mag >= 3) return '#ffd84d'
  if (mag >= 2) return '#a0e85a'
  return '#6ee7f0'
}

function formatNumber(n) {
  return new Intl.NumberFormat().format(n)
}

function App() {
  const [quakes, setQuakes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [minMag, setMinMag] = useState(0)
  const [timeRange, setTimeRange] = useState('day')

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        setError('')
        const url = timeRange === 'day'
          ? USGS_URL
          : timeRange === 'hour'
          ? 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson'
          : 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'
        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) throw new Error('Failed to fetch data')
        const data = await res.json()
        const items = data.features?.map(f => ({
          id: f.id,
          mag: f.properties.mag,
          place: f.properties.place,
          time: f.properties.time,
          depth: f.geometry.coordinates[2],
          coords: [f.geometry.coordinates[1], f.geometry.coordinates[0]],
          url: f.properties.url
        })) || []
        setQuakes(items)
      } catch (e) {
        if (e.name !== 'AbortError') setError('Could not load earthquakes')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [timeRange])

  const filtered = useMemo(() => quakes.filter(q => (q.mag ?? -Infinity) >= minMag), [quakes, minMag])
  const stats = useMemo(() => {
    const count = filtered.length
    const maxMag = filtered.reduce((m, q) => Math.max(m, q.mag ?? -Infinity), -Infinity)
    const avgMag = count ? (filtered.reduce((s, q) => s + (q.mag ?? 0), 0) / count) : 0
    return { count, maxMag: isFinite(maxMag) ? maxMag : 0, avgMag }
  }, [filtered])

  return (
    <div className="app-shell">
      <header className="header">
        <div className="brand">
          <div className="brand-badge">EQ</div>
          <div>
            <div>Earthquake Visualizer</div>
            <div style={{fontSize:12,color:'var(--muted)'}}>USGS live seismic activity</div>
          </div>
        </div>
        <div className="stats" role="status" aria-live="polite">
          <div className="stat">
            <div className="label">Earthquakes</div>
            <div className="value">{formatNumber(stats.count)}</div>
          </div>
          <div className="stat">
            <div className="label">Max mag</div>
            <div className="value">{stats.maxMag.toFixed(1)}</div>
          </div>
        </div>
      </header>

      <aside className="sidebar">
        <div className="card controls">
          <div className="control-group">
            <div className="label-row">
              <label htmlFor="timeRange">Time range</label>
            </div>
            <select id="timeRange" value={timeRange} onChange={e => setTimeRange(e.target.value)}>
              <option value="hour">Past hour</option>
              <option value="day">Past day</option>
              <option value="week">Past 7 days</option>
            </select>
          </div>

          <div className="control-group">
            <div className="label-row">
              <label htmlFor="minMag">Minimum magnitude: {minMag.toFixed(1)}</label>
            </div>
            <input id="minMag" type="range" min="0" max="7" step="0.1" value={minMag} onChange={e => setMinMag(parseFloat(e.target.value))} />
          </div>

          <div className="control-group">
            <button className="primary" onClick={() => setMinMag(0)}>Reset filters</button>
          </div>

          {loading && <div className="control-group"><div className="card">Loading earthquakes…</div></div>}
          {error && <div className="control-group"><div className="card" style={{borderColor:'rgba(255,0,0,0.3)'}}>Error: {error}</div></div>}
        </div>
      </aside>

      <main className="main">
        <div className="map-root">
          <MapContainer center={[20, 0]} zoom={2} minZoom={2} worldCopyJump zoomControl={true} style={{ height: '100%', width: '100%' }}>
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="OpenStreetMap">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Carto Light">
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap &copy; CARTO" />
              </LayersControl.BaseLayer>
            </LayersControl>

            <MarkerClusterGroup chunkedLoading>
              {filtered.map(q => {
                const radius = Math.max(4, (q.mag ?? 0) * 3)
                const color = magnitudeColor(q.mag ?? 0)
                return (
                  <CircleMarker key={q.id} center={q.coords} radius={radius} pathOptions={{ color, fillColor: color, fillOpacity: 0.6, weight: 1 }}>
                    <Popup>
                      <div style={{minWidth:220}}>
                        <div style={{fontWeight:800, marginBottom:6}}>M {q.mag?.toFixed(1) ?? 'N/A'} • {q.place}</div>
                        <div style={{fontSize:12, color:'var(--muted)'}}>Depth: {q.depth?.toFixed?.(1) ?? q.depth} km</div>
                        <div style={{fontSize:12, color:'var(--muted)'}}>Time: {new Date(q.time).toLocaleString()}</div>
                        <div style={{marginTop:8}}>
                          <a href={q.url} target="_blank" rel="noreferrer" style={{color:'var(--accent)'}}>Details on USGS ↗</a>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                )
              })}
            </MarkerClusterGroup>
          </MapContainer>
        </div>

        <div className="legend">
          <h4>Magnitude scale</h4>
          {[{t:'≥ 6',c:'#ff1f1f'},{t:'5-5.9',c:'#ff6a1f'},{t:'4-4.9',c:'#ffb21f'},{t:'3-3.9',c:'#ffd84d'},{t:'2-2.9',c:'#a0e85a'},{t:'< 2',c:'#6ee7f0'}].map((x)=> (
            <div key={x.t} className="legend-row"><span style={{display:'inline-flex',alignItems:'center',gap:8}}><span className="dot" style={{background:x.c}}></span>{x.t}</span></div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default App
