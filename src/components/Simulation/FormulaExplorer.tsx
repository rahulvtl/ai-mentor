import React from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

interface Props {
  formulas?: string[];
}

export const FormulaExplorer: React.FC<Props> = ({ formulas }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Formula Explorer</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Observe and interact with mathematical concepts.</p>
      </div>
      
      <div className="glass-panel" style={{ padding: '3rem', borderRadius: '16px', width: '100%', maxWidth: '600px', textAlign: 'center' }}>
        {formulas && formulas.length > 0 ? (
          formulas.map((f, i) => (
            <div key={i} style={{ margin: '1rem 0', fontSize: '1.5rem', padding: '1.5rem', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)' }}>
              <BlockMath math={f} />
            </div>
          ))
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>No formulas available for this topic.</p>
        )}
      </div>
    </div>
  );
};
