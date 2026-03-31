import React from 'react';
import { ArrowLeft, CalendarDays, BookOpen } from 'lucide-react';
import { getStudyPlan } from '../../services/studyDataService';
import { PlanRenderer } from './PlanRenderer';

interface Props {
  onBack: () => void;
  onLearnTopic: (topic: string) => void;
}

export const StudyDashboard: React.FC<Props> = ({ onBack, onLearnTopic }) => {
  const plan = getStudyPlan();

  const daysLeft = plan?.examDate
    ? Math.ceil((new Date(plan.examDate).getTime() - Date.now()) / 86_400_000)
    : null;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh', width: '100vw',
      background: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% 10%, rgba(59,130,246,0.05) 0%, transparent 60%)',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '1rem 2rem',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '34px', height: '34px', borderRadius: '10px',
            background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
            cursor: 'pointer', color: 'var(--text-secondary)',
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: 'var(--accent-blue)', padding: '0.45rem', borderRadius: '8px' }}>
            <CalendarDays size={16} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Study Dashboard</h1>
            {plan && (
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {plan.exam} &middot; {plan.dailyHours}h/day
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{
        flex: 1, overflowY: 'auto',
        padding: '1.5rem',
        maxWidth: '900px', width: '100%',
        margin: '0 auto',
      }}>
        {plan ? (
          <PlanRenderer
            planText={plan.content}
            daysLeft={daysLeft}
            exam={plan.exam}
            onLearnTopic={onLearnTopic}
          />
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '60vh', textAlign: 'center',
          }}>
            <BookOpen size={48} style={{ color: 'var(--text-secondary)', opacity: 0.3, marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: '0 0 0.5rem' }}>No Study Plan Yet</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', lineHeight: 1.5 }}>
              Generate a plan using the <strong>Study Planner</strong> first, then come here to track your progress and study.
            </p>
            <button
              onClick={onBack}
              style={{
                marginTop: '1.5rem', padding: '0.7rem 1.5rem', borderRadius: '12px',
                background: 'var(--accent-blue)', border: 'none',
                color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Go Back
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
