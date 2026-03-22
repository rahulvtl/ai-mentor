import React from 'react';
import { useSimulationState } from '../../hooks/useSimulationState';
import { Trash2 } from 'lucide-react';
import '../../index.css';

interface GridProps {
  onStateChange: (state: { width: number; height: number; area: number }) => void;
}

export const Grid: React.FC<GridProps> = ({ onStateChange }) => {
  const {
    gridSize,
    activeCells,
    handlePointerDown,
    handlePointerEnter,
    handlePointerUp,
    clearGrid,
    stats,
    getCellKey
  } = useSimulationState(10);

  // Trigger state change whenever stats update
  React.useEffect(() => {
    onStateChange(stats);
  }, [stats, onStateChange]);

  const cells = [];
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const isActive = activeCells.has(getCellKey(x, y));
      cells.push(
        <div
          key={getCellKey(x, y)}
          onPointerDown={() => handlePointerDown(x, y)}
          onPointerEnter={() => handlePointerEnter(x, y)}
          className={`grid-cell ${isActive ? 'active' : ''}`}
          style={{
            width: '100%',
            aspectRatio: '1',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backgroundColor: isActive ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease, transform 0.1s ease',
            transform: isActive ? 'scale(0.95)' : 'scale(1)',
            userSelect: 'none',
            touchAction: 'none' // Prevent scrolling when dragging on touch devices
          }}
        />
      );
    }
  }

  return (
    <div 
      className="grid-container flex flex-col items-center justify-center w-full h-full p-8"
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
    >
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Area Explorer</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Drag on the grid to create rectangles and explore area.</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`, 
            gap: '4px',
            width: '400px',
            maxWidth: '100%',
            marginBottom: '1.5rem'
          }}
        >
          {cells}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Width</span>
              <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>{stats.width}</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Height</span>
              <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>{stats.height}</div>
            </div>
            <div style={{ background: 'var(--accent-blue)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px' }}>
              <span style={{ opacity: 0.8, fontSize: '0.875rem' }}>Area</span>
              <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>{stats.area}</div>
            </div>
          </div>

          <button className="btn" onClick={clearGrid}>
            <Trash2 size={16} /> Clear
          </button>
        </div>
      </div>
    </div>
  );
};
