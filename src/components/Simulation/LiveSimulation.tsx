import React, { useEffect, useRef, useState } from 'react';
import { Play, RefreshCw, Loader2 } from 'lucide-react';
import { generateSimulation } from '../../services/claudeService';
import type { LearningModule } from '../../services/AiService';

interface Props {
  module: LearningModule;
  onStateChange: (state: any) => void;
}

export const LiveSimulation: React.FC<Props> = ({ module, onStateChange }) => {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const topicRef = useRef(module.topic);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setHtml(null);
    try {
      const result = await generateSimulation(
        module.topic,
        module.articleDescription ?? ''
      );
      setHtml(result);
      onStateChange({ simulationGenerated: true, topic: module.topic });
    } catch (e: any) {
      setError(e.message ?? 'Failed to generate simulation.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate on first mount or topic change
  useEffect(() => {
    if (module.topic !== topicRef.current) {
      topicRef.current = module.topic;
      setHtml(null);
      setError(null);
    }
  }, [module.topic]);

  if (html) {
    const blob = new Blob([html], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: '0.6rem 1.25rem',
          background: 'rgba(0,0,0,0.5)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Play size={14} style={{ color: 'var(--accent-green, #20c997)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>AI-Generated Simulation</span>
            <span style={{
              fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px',
              background: 'rgba(32,201,151,0.15)', color: '#20c997', fontWeight: 500,
            }}>
              Live
            </span>
          </div>
          <button
            onClick={generate}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)',
              background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)',
              fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <RefreshCw size={12} /> Regenerate
          </button>
        </div>
        <iframe
          ref={iframeRef}
          src={blobUrl}
          sandbox="allow-scripts allow-same-origin"
          style={{ width: '100%', flex: 1, border: 'none', background: '#07111f' }}
          title={`${module.topic} simulation`}
          onLoad={() => URL.revokeObjectURL(blobUrl)}
        />
      </div>
    );
  }

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1.25rem',
      background: 'linear-gradient(180deg, rgba(9,20,38,0.8), rgba(6,13,25,0.6))',
      padding: '2rem',
    }}>
      {loading ? (
        <>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(79,141,255,0.2), rgba(141,99,255,0.2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Loader2 size={28} style={{ color: '#4f8dff', animation: 'spin 1s linear infinite' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Generating simulation...
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              AI is building an interactive {module.topic} simulation for you
            </div>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      ) : error ? (
        <>
          <div style={{ color: '#ff6b6b', fontSize: '0.9rem', textAlign: 'center', maxWidth: 400 }}>
            {error}
          </div>
          <button
            onClick={generate}
            style={{
              padding: '0.6rem 1.5rem', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #4f8dff, #3f77e0)',
              color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              fontSize: '0.9rem',
            }}
          >
            Retry
          </button>
        </>
      ) : (
        <>
          <div style={{
            width: 80, height: 80, borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(79,141,255,0.15), rgba(141,99,255,0.15))',
            border: '1px solid rgba(79,141,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Play size={32} style={{ color: '#4f8dff' }} />
          </div>
          <div style={{ textAlign: 'center', maxWidth: 420 }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Interactive Simulation
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              AI will generate a live, interactive simulation for <strong>{module.topic}</strong> with
              adjustable controls and real-time visuals.
            </div>
          </div>
          <button
            onClick={generate}
            style={{
              padding: '0.7rem 2rem', borderRadius: '14px', border: 'none',
              background: 'linear-gradient(135deg, #4f8dff, #8d63ff)',
              color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              fontSize: '0.95rem', boxShadow: '0 4px 20px rgba(79,141,255,0.3)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            Generate Simulation
          </button>
        </>
      )}
    </div>
  );
};
