import React, { useState, useRef } from 'react';
import { X, FlaskConical, Loader2, AlertTriangle } from 'lucide-react';
import { streamGroqResponse } from '../../services/claudeService';

interface Props {
  onClose: () => void;
}

const PLACEHOLDER = `Examples of what to paste:

Mock Test 3 — JEE Main Pattern
Physics:    45 / 120  (Weak: Electrostatics, Optics)
Chemistry:  78 / 120  (Strong)
Maths:      23 / 120  (Weak: Calculus, Probability)
Total:     146 / 360

Time issues: Ran out of time in Maths.
Silly mistakes: 4 wrong due to calculation errors.`;

export const TestAnalysisModal: React.FC<Props> = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isAnalysing, setIsAnalysing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const analyse = async () => {
    if (!input.trim() || isAnalysing) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setResult('');
    setIsAnalysing(true);

    const system = `You are an expert academic coach specialising in JEE and NEET preparation.
Analyse student mock test results and provide brutally honest, specific, and actionable feedback.

Your analysis must include:
1. **Score Diagnosis** — what the scores reveal about preparation level
2. **Subject Priority Order** — which subject to fix first and why
3. **Top 3 Root Causes** — the real reasons behind the low scores (not generic advice)
4. **This Week's Action Plan** — exactly what to do in the next 7 days (specific topics)
5. **Exam Strategy Fix** — time management and question selection tips
6. **One Motivational Truth** — a realistic but encouraging closing statement

Be direct, specific, and data-driven. Avoid vague advice like "study harder" or "practice more".`;

    const user = `Analyse my mock test performance and give me an action plan:\n\n${input}`;

    await streamGroqResponse(
      system,
      user,
      (chunk) => setResult((prev) => prev + chunk),
      () => setIsAnalysing(false),
      (err) => { setResult(`Error: ${err.message}`); setIsAnalysing(false); },
      controller.signal
    );
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--accent-red)', padding: '0.6rem', borderRadius: '10px' }}>
              <FlaskConical size={20} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Test Analyser</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Paste your mock test results — AI diagnoses weak spots</p>
            </div>
          </div>
          <button onClick={onClose} style={iconBtn}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', flex: 1, minHeight: 0 }}>
          {/* Input */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={label}>Your Test Results</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={PLACEHOLDER}
              style={{
                flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                borderRadius: '12px', padding: '1rem', color: 'rgba(255,255,255,0.85)',
                fontSize: '0.82rem', lineHeight: 1.6, resize: 'none', outline: 'none',
                fontFamily: 'monospace', minHeight: '280px',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px' }}>
              <AlertTriangle size={13} color="var(--accent-red)" />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Include subject scores, weak topics, and any patterns you noticed</span>
            </div>
            <button
              onClick={analyse}
              disabled={!input.trim() || isAnalysing}
              style={{
                padding: '0.7rem', border: 'none', borderRadius: '10px', fontWeight: 700,
                fontSize: '0.85rem', cursor: !input.trim() || isAnalysing ? 'not-allowed' : 'pointer',
                background: !input.trim() || isAnalysing ? 'var(--border-color)' : 'var(--accent-red)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              {isAnalysing
                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Analysing…</>
                : <><FlaskConical size={15} /> Analyse My Results</>
              }
            </button>
          </div>

          {/* Output */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label style={{ ...label, marginBottom: '0.5rem' }}>AI Diagnosis & Action Plan</label>
            <div style={{
              flex: 1, background: 'var(--bg-primary)', borderRadius: '12px',
              border: '1px solid var(--border-color)', padding: '1.25rem',
              overflowY: 'auto', fontSize: '0.83rem', lineHeight: 1.7,
              color: 'rgba(255,255,255,0.85)', whiteSpace: 'pre-wrap', minHeight: '300px',
            }}>
              {result || (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '4rem' }}>
                  <FlaskConical size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                  <p>Paste your mock test scores on the left and click <strong>Analyse</strong></p>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>The more detail you give, the better the diagnosis</p>
                </div>
              )}
              {isAnalysing && (
                <span style={{ display: 'inline-block', width: '2px', height: '1em', background: 'var(--accent-red)', animation: 'blink 0.8s step-end infinite', verticalAlign: 'text-bottom' }} />
              )}
            </div>
          </div>
        </div>

        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
      </div>
    </div>
  );
};

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem',
};
const modal: React.CSSProperties = {
  background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)',
  padding: '1.75rem', width: '100%', maxWidth: '900px', maxHeight: '90vh',
  display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
};
const iconBtn: React.CSSProperties = {
  background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
  borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: 'var(--text-secondary)',
  display: 'flex', alignItems: 'center',
};
const label: React.CSSProperties = {
  display: 'block', fontSize: '0.72rem', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)',
};
