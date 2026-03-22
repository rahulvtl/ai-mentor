import React, { useState, useEffect } from 'react';
import { BlockMath } from 'react-katex';

function useIsMobile() {
  const [v, setV] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const h = () => setV(window.innerWidth <= 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return v;
}

interface Props {
  onStateChange: (state: any) => void;
}

export const InteractivePythagoras: React.FC<Props> = ({ onStateChange }) => {
  const isMobile = useIsMobile();
  const [solveFor, setSolveFor] = useState<'hypotenuse' | 'legA' | 'legB'>('hypotenuse');
  const [valA, setValA] = useState<string>('');
  const [valB, setValB] = useState<string>('');
  const [valC, setValC] = useState<string>('');

  useEffect(() => {
    let result = null;
    let aNum = parseFloat(valA);
    let bNum = parseFloat(valB);
    let cNum = parseFloat(valC);

    if (solveFor === 'hypotenuse') {
      if (!isNaN(aNum) && !isNaN(bNum)) {
        result = Math.sqrt(aNum * aNum + bNum * bNum);
        setValC(result.toFixed(2).replace(/\.00$/, ''));
      } else {
        setValC('');
      }
    } else if (solveFor === 'legA') {
      if (!isNaN(cNum) && !isNaN(bNum)) {
        if (cNum > bNum) {
          result = Math.sqrt(cNum * cNum - bNum * bNum);
          setValA(result.toFixed(2).replace(/\.00$/, ''));
        } else {
          setValA('Error');
        }
      } else {
        setValA('');
      }
    } else if (solveFor === 'legB') {
      if (!isNaN(cNum) && !isNaN(aNum)) {
        if (cNum > aNum) {
          result = Math.sqrt(cNum * cNum - aNum * aNum);
          setValB(result.toFixed(2).replace(/\.00$/, ''));
        } else {
          setValB('Error');
        }
      } else {
        setValB('');
      }
    }

    onStateChange({ solveFor, valA, valB, valC, result });
  }, [valA, valB, valC, solveFor, onStateChange]);

  const getFormula = () => {
    if (solveFor === 'hypotenuse') return 'c = \\sqrt{a^2 + b^2}';
    if (solveFor === 'legA') return 'a = \\sqrt{c^2 - b^2}';
    return 'b = \\sqrt{c^2 - a^2}';
  };

  return (
    <div className="animate-fade-in" style={{ padding: isMobile ? '1rem' : '3rem', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'center', overflow: 'auto' }}>
      
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Pythagorean Theorem Calculator</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Enter two sides of the right-angled triangle to calculate the third.</p>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '750px', display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
        
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Solve for</label>
            <select 
              value={solveFor}
              onChange={(e) => {
                setSolveFor(e.target.value as any);
                setValA(''); setValB(''); setValC('');
              }}
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '8px', width: '100%', fontSize: '1rem', outline: 'none' }}
            >
              <option value="hypotenuse">Hypotenuse (c)</option>
              <option value="legA">Leg (a)</option>
              <option value="legB">Leg (b)</option>
            </select>
          </div>

          <div style={{ fontSize: '1.25rem', marginBottom: '2rem', minHeight: '60px', display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)' }}>
            <BlockMath math={getFormula()} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {solveFor !== 'legA' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.25rem', fontStyle: 'italic', width: '40px', textAlign: 'center' }}>a</span>
                <input 
                  type="number" 
                  placeholder="Enter Leg a" 
                  value={valA} 
                  onChange={e => setValA(e.target.value)} 
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white', padding: '0.75rem', borderRadius: '8px', flex: 1, outline: 'none' }}
                />
              </div>
            )}
            {solveFor !== 'legB' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.25rem', fontStyle: 'italic', width: '40px', textAlign: 'center' }}>b</span>
                <input 
                  type="number" 
                  placeholder="Enter Leg b" 
                  value={valB} 
                  onChange={e => setValB(e.target.value)} 
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white', padding: '0.75rem', borderRadius: '8px', flex: 1, outline: 'none' }}
                />
              </div>
            )}
            {solveFor !== 'hypotenuse' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.25rem', fontStyle: 'italic', width: '40px', textAlign: 'center' }}>c</span>
                <input 
                  type="number" 
                  placeholder="Enter Hypotenuse" 
                  value={valC} 
                  onChange={e => setValC(e.target.value)} 
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white', padding: '0.75rem', borderRadius: '8px', flex: 1, outline: 'none' }}
                />
              </div>
            )}
            
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <span style={{ fontSize: '1.25rem', fontStyle: 'italic', width: '40px', textAlign: 'center', color: 'var(--accent-blue)', fontWeight: 'bold' }}>
                 {solveFor === 'hypotenuse' ? 'c =' : solveFor === 'legA' ? 'a =' : 'b ='}
               </span>
               <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-blue)' }}>
                 {solveFor === 'hypotenuse' ? (valC || '?') : solveFor === 'legA' ? (valA || '?') : (valB || '?')}
               </div>
            </div>

          </div>
        </div>

        <div style={{ flex: '1 1 250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="250" height="200" viewBox="0 0 250 200">
            <polygon points="20,180 230,180 20,20" fill="rgba(59, 130, 246, 0.05)" stroke="var(--accent-blue)" strokeWidth="3" strokeLinejoin="round" />
            <polyline points="20,160 40,160 40,180" fill="transparent" stroke="var(--text-secondary)" strokeWidth="2" />
            <text x="5" y="100" fill="var(--text-primary)" fontSize="18" fontStyle="italic">a</text>
            <text x="120" y="198" fill="var(--text-primary)" fontSize="18" fontStyle="italic">b</text>
            <text x="135" y="90" fill="var(--accent-blue)" fontSize="18" fontStyle="italic" fontWeight="bold">c</text>
          </svg>
        </div>

      </div>
    </div>
  );
};
