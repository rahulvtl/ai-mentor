import React, { useEffect, useState } from 'react';
import { FileText, Clock, Map, Play } from 'lucide-react';
import { FormulaExplorer } from './FormulaExplorer';
import { InteractivePythagoras } from './InteractivePythagoras';
import { InteractiveAngles } from './InteractiveAngles';
import { InteractiveRectangleArea } from './InteractiveRectangleArea';
import { ArticleExplorer } from './ArticleExplorer';
import { TimelineWorkspace } from './TimelineWorkspace';
import { MapWorkspace } from './MapWorkspace';
import { LiveSimulation } from './LiveSimulation';
import type { LearningModule } from '../../services/AiService';

interface Props {
  module: LearningModule;
  onStateChange: (state: any) => void;
}

type ViewMode = 'article' | 'timeline' | 'map' | 'simulation';

const VIEW_OPTIONS: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
  { key: 'article',    label: 'Article',    icon: <FileText size={13} /> },
  { key: 'timeline',   label: 'Timeline',   icon: <Clock size={13} /> },
  { key: 'map',        label: 'Map',        icon: <Map size={13} /> },
  { key: 'simulation', label: 'Simulate',   icon: <Play size={13} /> },
];

/** Whether a module supports the view switcher (non-STEM content types) */
function isContentModule(type: LearningModule['type']): boolean {
  return type === 'article' || type === 'timeline' || type === 'map';
}

export const DynamicWorkspace: React.FC<Props> = ({ module, onStateChange }) => {
  const [viewOverride, setViewOverride] = useState<ViewMode | null>(null);

  // Reset view override whenever the topic changes
  useEffect(() => {
    onStateChange({});
    setViewOverride(null);
  }, [module, onStateChange]);

  // ── STEM / simulation types — no view switcher ───────────────────────────
  if (module.type === 'calculator' && module.calculatorType === 'pythagoras') {
    return <InteractivePythagoras onStateChange={onStateChange} />;
  }
  if (module.type === 'angles') {
    return <InteractiveAngles onStateChange={onStateChange} />;
  }
  if (module.type === 'grid' || module.type === 'area-interactive') {
    return <InteractiveRectangleArea onStateChange={onStateChange} />;
  }
  if ((module.type === 'phet' || module.type === 'theoretical') && (module.phetUrl || module.iframeUrl)) {
    const url = module.phetUrl || module.iframeUrl;
    const provider = module.type === 'phet' ? 'PhET Interactive Simulations' : 'Visible Body Educational Resources';
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.25rem 2rem', background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' }}>
          <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700, letterSpacing: '-0.025em' }}>Interactive Exploration</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0 0 0', opacity: 0.8 }}>Provided by {provider}</p>
        </div>
        <iframe
          src={url}
          style={{ width: '100%', flex: 1, border: 'none', background: '#0a0a0a' }}
          title={module.topic}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }

  // ── Content types (article / timeline / map) — show view switcher ────────
  if (isContentModule(module.type)) {
    const activeView: ViewMode = viewOverride ?? 'article';

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* View switcher bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap',
          padding: '0.5rem 1.25rem', background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)', flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, marginRight: '0.25rem' }}>View:</span>
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setViewOverride(opt.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.3rem 0.75rem', borderRadius: '20px', border: 'none',
                background: activeView === opt.key ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                color: activeView === opt.key ? 'white' : 'var(--text-secondary)',
                fontSize: '0.72rem', fontWeight: activeView === opt.key ? 700 : 400,
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {activeView === 'article'    && <ArticleExplorer  module={module} onStateChange={onStateChange} />}
          {activeView === 'timeline'   && <TimelineWorkspace module={module} onStateChange={onStateChange} />}
          {activeView === 'map'        && <MapWorkspace      module={module} onStateChange={onStateChange} />}
          {activeView === 'simulation' && <LiveSimulation    module={module} onStateChange={onStateChange} />}
        </div>
      </div>
    );
  }

  return <FormulaExplorer formulas={module.formulas || []} />;
};
