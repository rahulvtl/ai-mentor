import React, { useState, useRef } from 'react';
import { X, CalendarDays, Loader2, BookOpen, Save, CheckCircle } from 'lucide-react';
import { streamGroqResponse } from '../../services/claudeService';
import { saveStudyPlan } from '../../services/studyDataService';

interface Props {
  onClose: () => void;
}

const EXAMS = ['JEE Main', 'JEE Advanced', 'NEET', 'CBSE Class 12'];
const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];
const HOURS = [2, 3, 4, 5, 6, 7, 8, 10, 12];

export const StudyPlannerModal: React.FC<Props> = ({ onClose }) => {
  const [exam, setExam] = useState('');
  const [examDate, setExamDate] = useState('');
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);
  const [dailyHours, setDailyHours] = useState(6);
  const [planText, setPlanText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const toggleSubject = (sub: string) =>
    setWeakSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );

  const daysLeft = examDate
    ? Math.ceil((new Date(examDate).getTime() - Date.now()) / 86_400_000)
    : null;

  const generate = async () => {
    if (!exam || !examDate) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setPlanText('');
    setSaved(false);
    setIsGenerating(true);

    const system = `You are an expert academic coach for Indian competitive exams (JEE/NEET).
Create detailed, realistic weekly study plans. Be specific with timings, topics, and advice.
Format the plan clearly with days, subjects, and hours. Include:
- A brief strategy overview
- Day-by-day weekly schedule
- Subject-wise priority order
- Daily revision tips
- Key warnings (what NOT to do)
Keep it motivating but realistic.`;

    const user = `Create a personalised weekly study plan for a student with these details:
- Target exam: ${exam}
- Exam date: ${examDate} (${daysLeft} days remaining)
- Weak subjects: ${weakSubjects.length ? weakSubjects.join(', ') : 'None specified'}
- Available study hours per day: ${dailyHours} hours
- Strong subjects: ${SUBJECTS.filter((s) => !weakSubjects.includes(s)).join(', ')}

Generate a detailed 7-day weekly study schedule with subject-wise time allocation, key topics to cover first, and daily revision strategy.`;

    await streamGroqResponse(
      system,
      user,
      (chunk) => setPlanText((prev) => prev + chunk),
      () => setIsGenerating(false),
      (err) => {
        setPlanText(`Error: ${err.message}`);
        setIsGenerating(false);
      },
      controller.signal
    );
  };

  const handleSave = () => {
    saveStudyPlan({
      generatedAt: new Date().toISOString(),
      exam,
      examDate,
      weakSubjects,
      dailyHours,
      content: planText,
    });
    setSaved(true);
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--accent-blue)', padding: '0.6rem', borderRadius: '10px' }}>
              <CalendarDays size={20} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Study Planner</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AI-generated personalised schedule</p>
            </div>
          </div>
          <button onClick={onClose} style={iconBtn}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>
          {/* Left — config panel */}
          <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Exam */}
            <div>
              <label style={label}>Target Exam</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {EXAMS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setExam(e)}
                    style={{ ...chipBtn, borderColor: exam === e ? 'var(--accent-blue)' : 'var(--border-color)', color: exam === e ? 'var(--accent-blue)' : 'var(--text-secondary)' }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Exam date */}
            <div>
              <label style={label}>Exam Date</label>
              <input
                type="date"
                value={examDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setExamDate(e.target.value)}
                style={dateInput}
              />
              {daysLeft !== null && (
                <p style={{ fontSize: '0.72rem', color: daysLeft < 60 ? 'var(--accent-red)' : 'var(--accent-green)', marginTop: '0.3rem' }}>
                  {daysLeft} days remaining
                </p>
              )}
            </div>

            {/* Weak subjects */}
            <div>
              <label style={label}>Weak Subjects</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {SUBJECTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSubject(s)}
                    style={{ ...chipBtn, borderColor: weakSubjects.includes(s) ? 'var(--accent-red)' : 'var(--border-color)', color: weakSubjects.includes(s) ? 'var(--accent-red)' : 'var(--text-secondary)' }}
                  >
                    {weakSubjects.includes(s) ? '⚠ ' : ''}{s}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily hours */}
            <div>
              <label style={label}>Daily Study Hours: <strong style={{ color: 'white' }}>{dailyHours}h</strong></label>
              <input
                type="range"
                min={2} max={12} step={1}
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-blue)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                <span>2h</span><span>12h</span>
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={generate}
              disabled={!exam || !examDate || isGenerating}
              style={{
                padding: '0.7rem',
                background: !exam || !examDate || isGenerating ? 'var(--border-color)' : 'var(--accent-blue)',
                border: 'none', borderRadius: '10px', color: 'white', fontWeight: 700,
                cursor: !exam || !examDate || isGenerating ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              {isGenerating
                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
                : <><BookOpen size={15} /> Generate Plan</>
              }
            </button>
          </div>

          {/* Right — plan output */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{
              flex: 1,
              background: 'var(--bg-primary)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              padding: '1.25rem',
              overflowY: 'auto',
              fontFamily: 'inherit',
              fontSize: '0.84rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.85)',
              whiteSpace: 'pre-wrap',
              minHeight: '300px',
            }}>
              {planText || (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '4rem' }}>
                  <CalendarDays size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                  <p>Select your exam, date, and preferences then hit <strong>Generate Plan</strong></p>
                </div>
              )}
              {isGenerating && (
                <span style={{ display: 'inline-block', width: '2px', height: '1em', background: 'var(--accent-blue)', animation: 'blink 0.8s step-end infinite', verticalAlign: 'text-bottom' }} />
              )}
            </div>

            {planText && !isGenerating && (
              <button
                onClick={handleSave}
                disabled={saved}
                style={{
                  marginTop: '0.75rem', padding: '0.6rem 1rem',
                  background: saved ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)',
                  border: `1px solid ${saved ? 'var(--accent-green)' : 'rgba(16,185,129,0.3)'}`,
                  borderRadius: '10px', color: 'var(--accent-green)', cursor: saved ? 'default' : 'pointer',
                  fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                }}
              >
                {saved ? <><CheckCircle size={14} /> Saved to your profile!</> : <><Save size={14} /> Save Plan</>}
              </button>
            )}
          </div>
        </div>

        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
      </div>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem',
};
const modal: React.CSSProperties = {
  background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)',
  padding: '1.75rem', width: '100%', maxWidth: '860px', maxHeight: '90vh',
  display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
};
const iconBtn: React.CSSProperties = {
  background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
  borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: 'var(--text-secondary)',
  display: 'flex', alignItems: 'center',
};
const label: React.CSSProperties = {
  display: 'block', fontSize: '0.72rem', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.08em',
  color: 'var(--text-secondary)', marginBottom: '0.5rem',
};
const chipBtn: React.CSSProperties = {
  padding: '0.4rem 0.75rem', background: 'var(--bg-tertiary)',
  border: '1px solid', borderRadius: '8px', cursor: 'pointer',
  fontSize: '0.78rem', textAlign: 'left', transition: 'all 0.15s',
};
const dateInput: React.CSSProperties = {
  width: '100%', padding: '0.5rem 0.6rem', background: 'var(--bg-tertiary)',
  border: '1px solid var(--border-color)', borderRadius: '8px',
  color: 'white', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box',
};
