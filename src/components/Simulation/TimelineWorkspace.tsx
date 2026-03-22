import React, { useEffect, useState } from 'react';
import { Loader2, Clock, Sword, Users, DollarSign, Palette, FlaskConical, Globe } from 'lucide-react';
import { generateTimeline, type TimelineEvent } from '../../services/claudeService';
import type { LearningModule } from '../../services/AiService';

interface Props {
  module: LearningModule;
  onStateChange: (state: Record<string, unknown>) => void;
}

const CATEGORY_STYLE: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  political:  { color: '#60a5fa', bg: 'rgba(59,130,246,0.15)',   icon: <Globe size={12} /> },
  military:   { color: '#f87171', bg: 'rgba(239,68,68,0.15)',    icon: <Sword size={12} /> },
  social:     { color: '#34d399', bg: 'rgba(16,185,129,0.15)',   icon: <Users size={12} /> },
  economic:   { color: '#fbbf24', bg: 'rgba(245,158,11,0.15)',   icon: <DollarSign size={12} /> },
  cultural:   { color: '#a78bfa', bg: 'rgba(139,92,246,0.15)',   icon: <Palette size={12} /> },
  scientific: { color: '#22d3ee', bg: 'rgba(34,211,238,0.15)',   icon: <FlaskConical size={12} /> },
};

export const TimelineWorkspace: React.FC<Props> = ({ module, onStateChange }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    onStateChange({ readingTopic: module.topic });
    setEvents([]);
    setLoading(true);
    setError('');
    setSelected(null);

    generateTimeline(module.topic, module.articleDescription ?? '')
      .then((ev) => {
        if (ev.length === 0) setError('Could not generate timeline. Try asking the AI Tutor.');
        else setEvents(ev);
      })
      .catch(() => setError('Failed to generate timeline. Check your connection.'))
      .finally(() => setLoading(false));
  }, [module.topic]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', background: 'var(--bg-primary)' }}>
        <Loader2 size={36} color="var(--accent-blue)" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Building timeline for <strong style={{ color: 'white' }}>{module.topic}</strong>…
        </p>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', background: 'var(--bg-primary)' }}>
        <Clock size={36} style={{ opacity: 0.3 }} />
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', overflowY: 'auto', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ padding: '2rem 2.5rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <Clock size={16} color="var(--accent-blue)" />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-secondary)' }}>
            Historical Timeline
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'white' }}>{module.topic}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.3rem' }}>
          {events.length} key events · Click any event to expand
        </p>

        {/* Category legend */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>
          {Object.entries(CATEGORY_STYLE).map(([cat, s]) => (
            <span key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.6rem', borderRadius: '20px', background: s.bg, border: `1px solid ${s.color}44`, color: s.color, fontSize: '0.68rem', fontWeight: 600 }}>
              {s.icon} {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ padding: '2rem 2.5rem', maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: '110px', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(to bottom, var(--accent-blue), var(--accent-purple))', opacity: 0.35 }} />

          {events.map((ev, i) => {
            const style = CATEGORY_STYLE[ev.category] ?? CATEGORY_STYLE.political;
            const isSelected = selected === i;

            return (
              <div
                key={i}
                className="animate-fade-in"
                style={{ display: 'flex', gap: '0', marginBottom: '0.85rem', cursor: 'pointer' }}
                onClick={() => setSelected(isSelected ? null : i)}
              >
                {/* Year label */}
                <div style={{ width: '110px', flexShrink: 0, paddingRight: '1.25rem', paddingTop: '0.6rem', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: style.color, display: 'block', lineHeight: 1.2 }}>{ev.year}</span>
                </div>

                {/* Dot on the line */}
                <div style={{ position: 'relative', flexShrink: 0, width: '0', display: 'flex', alignItems: 'flex-start', paddingTop: '0.85rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: style.color, border: `2px solid var(--bg-primary)`, marginLeft: '-5px', boxShadow: `0 0 8px ${style.color}66`, flexShrink: 0, zIndex: 1 }} />
                </div>

                {/* Card */}
                <div style={{ flex: 1, marginLeft: '1.25rem', background: isSelected ? style.bg : 'var(--bg-secondary)', border: `1px solid ${isSelected ? style.color + '55' : 'var(--border-color)'}`, borderRadius: '10px', padding: '0.7rem 1rem', transition: 'all 0.2s ease' }}>
                  {/* Category chip */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: style.color }}>
                      {style.icon} {ev.category}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: 'white', lineHeight: 1.4 }}>{ev.title}</p>
                  {isSelected && (
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.65 }}>{ev.description}</p>
                  )}
                  {!isSelected && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {ev.description.slice(0, 80)}{ev.description.length > 80 ? '…' : ''}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
