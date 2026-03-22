import React, { useState, useEffect, useMemo } from 'react';
import { Mafs, Coordinates, Vector, MovablePoint, Polygon, Text, Theme } from 'mafs';
import 'mafs/core.css';
import 'mafs/font.css';

interface Props {
  onStateChange: (state: any) => void;
}

export const InteractiveAngles: React.FC<Props> = ({ onStateChange }) => {
  const [point, setPoint] = useState<[number, number]>([3, 4]);
  const [snapToGrid, setSnapToGrid] = useState(false);

  // Manual input state (strings to allow editing)
  const [inputAngle, setInputAngle] = useState('');
  const [inputMag, setInputMag] = useState('');

  const { angle, magnitude } = useMemo(() => {
    const r = Math.sqrt(point[0] ** 2 + point[1] ** 2);
    let theta = Math.atan2(point[1], point[0]) * (180 / Math.PI);
    if (theta < 0) theta += 360;
    return { angle: theta, magnitude: r };
  }, [point]);

  // Sync inputs with point on load and point change
  useEffect(() => {
    setInputAngle(angle.toFixed(1));
    setInputMag(magnitude.toFixed(1));
    onStateChange({ x: point[0], y: point[1], angle, magnitude });
  }, [point, angle, magnitude, onStateChange]);

  const handleAngleSubmit = (val: string) => {
    const a = parseFloat(val);
    if (isNaN(a)) return;
    const rad = a * (Math.PI / 180);
    setPoint([magnitude * Math.cos(rad), magnitude * Math.sin(rad)]);
  };

  const handleMagSubmit = (val: string) => {
    const r = parseFloat(val);
    if (isNaN(r) || r < 0) return;
    const rad = angle * (Math.PI / 180);
    setPoint([r * Math.cos(rad), r * Math.sin(rad)]);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-primary)', overflow: 'auto' }}>
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Interactive Vector & Angle Sandbox</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Click and drag the glowing node, or use manual inputs for precision.</p>
      </div>
      
      <div style={{ display: 'flex', gap: '2rem', width: '100%', maxWidth: '1000px', flex: 1, minHeight: '550px' }}>
        
        {/* Mafs Library Diagram Container */}
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
            <Mafs viewBox={{ x: [-8, 8], y: [-6, 6] }} zoom={true}>
              <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: 1 }} />
              
              {/* Triangle shading */}
              <Polygon
                points={[[0, 0], [point[0], 0], point]}
                color={Theme.blue}
                weight={2}
                fillOpacity={0.15}
              />

              {/* Vector Components */}
              <Vector tail={[0,0]} tip={[point[0], 0]} color={Theme.green} style="dashed" />
              <Vector tail={[point[0], 0]} tip={point} color={Theme.red} style="dashed" />
              
              {/* Main Vector */}
              <Vector tail={[0, 0]} tip={point} color={Theme.blue} weight={3} />

              {/* Draggable Point */}
              <MovablePoint
                point={point}
                onMove={(p) => {
                  if (snapToGrid) {
                    setPoint([Math.round(p[0]), Math.round(p[1])]);
                  } else {
                    setPoint([p[0], p[1]]);
                  }
                }}
                color={Theme.indigo}
              />
              
              <Text x={point[0] / 2} y={-0.6} color={Theme.green}>x</Text>
              <Text x={point[0] + 0.6} y={point[1] / 2} color={Theme.red}>y</Text>
            </Mafs>
          </div>
        </div>
        
        {/* Real-time Data Panel */}
        <div className="glass-panel" style={{ width: '320px', padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Angle (θ)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="number" 
                value={inputAngle}
                onChange={(e) => setInputAngle(e.target.value)}
                onBlur={() => handleAngleSubmit(inputAngle)}
                onKeyDown={(e) => e.key === 'Enter' && handleAngleSubmit(inputAngle)}
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.5rem', borderRadius: '8px', fontSize: '1.25rem', width: '100px', outline: 'none', fontWeight: 'bold' }}
              />
              <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>°</span>
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Magnitude (r)</div>
            <input 
              type="number" 
              value={inputMag}
              onChange={(e) => setInputMag(e.target.value)}
              onBlur={() => handleMagSubmit(inputMag)}
              onKeyDown={(e) => e.key === 'Enter' && handleMagSubmit(inputMag)}
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.5rem', borderRadius: '8px', fontSize: '1.25rem', width: '100%', outline: 'none', fontWeight: 'bold' }}
            />
          </div>

          <div style={{ marginTop: 'auto', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
             <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Cartesian Coordinates (x, y)</div>
             
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-primary)', width: '30px' }}>X:</span>
                <input 
                  type="number" 
                  value={point[0].toFixed(2)}
                  onChange={(e) => {
                    const x = parseFloat(e.target.value);
                    if (!isNaN(x)) setPoint([x, point[1]]);
                  }}
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--accent-green)', padding: '0.5rem', borderRadius: '8px', width: '100%', outline: 'none', fontWeight: 'bold' }}
                />
             </div>

             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: 'var(--text-primary)', width: '30px' }}>Y:</span>
                <input 
                  type="number" 
                  value={point[1].toFixed(2)}
                  onChange={(e) => {
                    const y = parseFloat(e.target.value);
                    if (!isNaN(y)) setPoint([point[0], y]);
                  }}
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--accent-red)', padding: '0.5rem', borderRadius: '8px', width: '100%', outline: 'none', fontWeight: 'bold' }}
                />
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};
