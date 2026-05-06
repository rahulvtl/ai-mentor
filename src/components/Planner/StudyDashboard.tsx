import React, { useState, useCallback } from 'react';
import { ArrowLeft, CalendarDays, BookOpen, Plus, Pencil, Trash2 } from 'lucide-react';
import { getStudyPlan, deleteStudyPlan, type StudyPlan } from '../../services/studyDataService';
import { PlanRenderer } from './PlanRenderer';
import { StudyPlannerModal } from './StudyPlannerModal';

interface Props {
  onBack: () => void;
  onLearnTopic: (topic: string) => void;
}

type ModalMode = null | 'new' | 'edit';

export const StudyDashboard: React.FC<Props> = ({ onBack, onLearnTopic }) => {
  const [plan, setPlan] = useState<StudyPlan | null>(getStudyPlan());
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const refreshPlan = useCallback(() => setPlan(getStudyPlan()), []);

  const handleModalClose = () => {
    setModalMode(null);
    refreshPlan();
  };

  const handleDelete = () => {
    deleteStudyPlan();
    setPlan(null);
    setConfirmDelete(false);
  };

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

        {/* Action buttons */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          {plan && (
            <>
              <button
                onClick={() => setModalMode('edit')}
                style={actionBtn('rgba(59,130,246,0.1)', 'rgba(59,130,246,0.3)', 'var(--accent-blue)')}
                title="Edit plan inputs and re-generate"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                style={actionBtn('rgba(239,68,68,0.1)', 'rgba(239,68,68,0.3)', 'var(--accent-red)')}
                title="Delete this study plan"
              >
                <Trash2 size={14} /> Delete
              </button>
            </>
          )}
          <button
            onClick={() => setModalMode('new')}
            style={actionBtn('rgba(16,185,129,0.1)', 'rgba(16,185,129,0.3)', 'var(--accent-green)')}
            title={plan ? 'Replace with a new plan' : 'Create a new plan'}
          >
            <Plus size={14} /> New
          </button>
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
              Create a personalised AI study plan to track your progress and study smarter.
            </p>
            <button
              onClick={() => setModalMode('new')}
              style={{
                marginTop: '1.5rem', padding: '0.7rem 1.5rem', borderRadius: '12px',
                background: 'var(--accent-blue)', border: 'none',
                color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              }}
            >
              <Plus size={16} /> Create Study Plan
            </button>
          </div>
        )}
      </main>

      {/* Planner modal — used for both New and Edit */}
      {modalMode && (
        <StudyPlannerModal
          onClose={handleModalClose}
          initialPlan={modalMode === 'edit' ? plan : null}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div style={confirmOverlay} onClick={() => setConfirmDelete(false)}>
          <div style={confirmDialog} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <div style={{ background: 'rgba(239,68,68,0.15)', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
                <Trash2 size={18} color="var(--accent-red)" />
              </div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Delete study plan?</h3>
            </div>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              This will permanently remove your current plan and any progress checkmarks. This can't be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(false)} style={cancelBtn}>Cancel</button>
              <button onClick={handleDelete} style={dangerBtn}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const actionBtn = (bg: string, border: string, color: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
  padding: '0.4rem 0.8rem', borderRadius: '20px',
  background: bg, border: `1px solid ${border}`,
  color, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
});

const confirmOverlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 200, padding: '1rem',
};
const confirmDialog: React.CSSProperties = {
  background: 'var(--bg-secondary)', borderRadius: '14px',
  border: '1px solid var(--border-color)', padding: '1.5rem',
  width: '100%', maxWidth: '380px',
  boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
};
const cancelBtn: React.CSSProperties = {
  padding: '0.5rem 1rem', borderRadius: '8px',
  background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
  color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
};
const dangerBtn: React.CSSProperties = {
  padding: '0.5rem 1rem', borderRadius: '8px',
  background: 'var(--accent-red)', border: 'none',
  color: 'white', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
};
