import React, { useState, useEffect } from 'react';
import { Mafs, Coordinates, Polygon, MovablePoint, Theme, Text, Line } from 'mafs';
import { BlockMath } from 'react-katex';
import 'mafs/core.css';
import 'mafs/font.css';
import 'katex/dist/katex.min.css';

interface Props {
  onStateChange: (state: any) => void;
}

export const InteractiveRectangleArea: React.FC<Props> = ({ onStateChange }) => {
  const [point, setPoint] = useState<[number, number]>([5, 3]);
  const [snapToGrid, setSnapToGrid] = useState(true);

  const l = point[0];
  const w = point[1];
  const area = l * w;

  useEffect(() => {
    onStateChange({ length: l, width: w, area });
  }, [l, w, area, onStateChange]);

  const handleLengthChange = (val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) setPoint([num, point[1]]);
  };

  const handleWidthChange = (val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) setPoint([point[0], num]);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-primary)', overflow: 'auto' }}>
      
      <div style={{ display: 'flex', gap: '2rem', width: '100%', maxWidth: '1100px', flex: 1, minHeight: '550px' }}>
        
        {/* Left Side: Math Calculator (Google Style) */}
        <div className="glass-panel" style={{ width: '400px', padding: '2.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--border-color)' }}>
          <div>
             <h2 style={{ fontSize: '2rem', marginBottom: '0.25rem', color: 'var(--text-primary)', fontWeight: '500' }}>Rectangle</h2>
             <p style={{ color: 'var(--text-secondary)' }}>Solve for area ▼</p>
          </div>
          
          <div style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
             <BlockMath math="A = l \times w" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '100px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <span style={{ fontSize: '1.5rem', fontStyle: 'italic', fontWeight: 'bold' }}>l</span>
                 <span style={{ color: 'var(--text-secondary)' }}>Length</span>
              </div>
              <input 
                type="number" 
                value={l.toFixed(1)} 
                onChange={(e) => handleLengthChange(e.target.value)}
                style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', fontSize: '1rem', outline: 'none' }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '100px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <span style={{ fontSize: '1.5rem', fontStyle: 'italic', fontWeight: 'bold' }}>w</span>
                 <span style={{ color: 'var(--text-secondary)' }}>Width</span>
              </div>
              <input 
                type="number" 
                value={w.toFixed(1)} 
                onChange={(e) => handleWidthChange(e.target.value)}
                style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', fontSize: '1rem', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ marginTop: 'auto', background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '12px' }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Solution</div>
            <BlockMath math={`A = ${l.toFixed(1)} \\times ${w.toFixed(1)} = ${area.toFixed(1)}`} />
          </div>

        </div>

        {/* Right Side: Mafs Interactive Diagram */}
        <div className="glass-panel" style={{ flex: 1, padding: '1rem', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: '#1a1a1a' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input 
                type="checkbox" 
                checked={snapToGrid} 
                onChange={(e) => setSnapToGrid(e.target.checked)} 
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-blue)' }}
              />
              Snap to Integer Grid
            </label>
          </div>

          <div style={{ width: '100%', flex: 1, minHeight: '400px' }}>
            <Mafs viewBox={{ x: [-2, Math.max(10, l + 2)], y: [-2, Math.max(10, w + 2)] }} zoom={true}>
              <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: 1 }} />
              
              {/* Rectangle Polygon */}
              <Polygon
                points={[[0, 0], [l, 0], [l, w], [0, w]]}
                color={Theme.blue}
                weight={2}
                fillOpacity={0.15}
              />

              {/* Diagonal line */}
              <Line.Segment point1={[0,0]} point2={[l,w]} color={Theme.indigo} weight={1} style="dashed" />

              {/* Draggable Corner */}
              <MovablePoint
                point={point}
                onMove={(p) => {
                  const x = Math.max(0.1, p[0]);
                  const y = Math.max(0.1, p[1]);
                  if (snapToGrid) {
                    setPoint([Math.round(x), Math.round(y)]);
                  } else {
                    setPoint([x, y]);
                  }
                }}
                color={Theme.blue}
              />

              {/* Labels */}
              <Text x={l / 2} y={-0.5} color={Theme.foreground}>l</Text>
              <Text x={-0.5} y={w / 2} color={Theme.foreground}>w</Text>
              <Text x={l / 2} y={w / 2 + 0.3} color={Theme.indigo}>d</Text>
            </Mafs>
          </div>
        </div>

      </div>
    </div>
  );
};
