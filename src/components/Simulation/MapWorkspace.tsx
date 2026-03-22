import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Loader2, MapPin } from 'lucide-react';
import L from 'leaflet';
import { generateMapMarkers, type MapData } from '../../services/claudeService';
import type { LearningModule } from '../../services/AiService';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's broken default icon paths in Vite/webpack builds
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Props {
  module: LearningModule;
  onStateChange: (state: Record<string, unknown>) => void;
}

export const MapWorkspace: React.FC<Props> = ({ module, onStateChange }) => {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    onStateChange({ readingTopic: module.topic });
    setMapData(null);
    setLoading(true);
    setError('');

    generateMapMarkers(module.topic, module.articleDescription ?? '')
      .then((data) => setMapData(data))
      .catch((err) => {
        console.error('Map error:', err);
        setError(`Failed to load map: ${err?.message ?? 'Unknown error'}`);
      })
      .finally(() => setLoading(false));
  }, [module.topic]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', background: 'var(--bg-primary)' }}>
        <Loader2 size={36} color="var(--accent-blue)" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Mapping <strong style={{ color: 'white' }}>{module.topic}</strong>…
        </p>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error || !mapData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', background: 'var(--bg-primary)' }}>
        <MapPin size={36} style={{ opacity: 0.3 }} />
        <p style={{ color: 'var(--text-secondary)' }}>{error || 'No map data available.'}</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        <MapPin size={16} color="var(--accent-blue)" />
        <div>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{module.topic}</h2>
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            {mapData.markers.length} locations · Click markers for details
          </p>
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={[mapData.center.lat, mapData.center.lng]}
          zoom={mapData.zoom}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mapData.markers.map((marker, i) => (
            <Marker key={i} position={[marker.lat, marker.lng]}>
              <Popup>
                <div style={{ maxWidth: '200px' }}>
                  <strong style={{ fontSize: '0.85rem' }}>{marker.title}</strong>
                  <p style={{ fontSize: '0.78rem', marginTop: '0.3rem', color: '#555' }}>{marker.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Marker list */}
      {mapData.markers.length > 0 && (
        <div style={{ padding: '0.75rem 1.25rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flexShrink: 0 }}>
          {mapData.markers.map((m, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.6rem', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '20px', fontSize: '0.7rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
              <MapPin size={10} /> {m.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
