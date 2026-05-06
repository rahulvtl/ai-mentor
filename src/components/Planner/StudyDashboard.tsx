import React, { useState, useCallback, useMemo } from 'react';
import { ArrowLeft, CalendarDays, BookOpen, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { getStudyPlans, deleteStudyPlan, type StudyPlan } from '../../services/studyDataService';
import { PlanRenderer } from './PlanRenderer';
import { StudyPlannerModal } from './StudyPlannerModal';

interface Props {
  onBack: () => void;
  onLearnTopic: (topic: string) => void;
}

type ModalState = null | { mode: 'new' } | { mode: 'edit'; plan: StudyPlan };

function daysLeftOf(plan: StudyPlan): number | null {
  if (!plan.examDate) return null;
  return Math.ceil((new Date(plan.examDate).getTime() - Date.now()) / 86_400_000);
}

function formatGenerated(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const diffMs = Date.now() - d.getTime();
    const days = Math.floor(diffMs / 86_400_000);
    if (days <= 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 30) return `${days}d ago`;
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

export const StudyDashboard: React.FC<Props> = ({ onBack, onLearnTopic }) => {
  const [plans, setPlans] = useState<StudyPlan[]>(getStudyPlans());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const refresh = useCallback(() => setPlans(getStudyPlans()), []);

  const selected = useMemo(
    () => (selectedId ? plans.find((p) => p.id === selectedId) ?? null : null),
    [plans, selectedId]
  );

  const handleModalClose = () => {
    setModal(null);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteStudyPlan(id);
    setPlans(getStudyPlans());
    setConfirmDeleteId(null);
    if (selectedId === id) setSelectedId(null);
  };

  // ── Detail view ─────────────────────────────────────────────────────────────
  if (selected) {
    const dl = daysLeftOf(selected);
    return (
      <div style={pageWrap}>
        <header style={headerBar}>
          <button onClick={() => setSelectedId(null)} style={backBtn} title="Back to plans">
            <ArrowLeft size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: 'var(--accent-blue)', padding: '0.45rem', borderRadius: '8px' }}>
              <CalendarDays size={16} color="white" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{selected.exam} Plan</h1>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {selected.dailyHours}h/day &middot; generated {formatGenerated(selected.generatedAt)}
              </p>
            </div>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setModal({ mode: 'edit', plan: selected })} style={actionBtn('rgba(59,130,246,0.1)', 'rgba(59,130,246,0.3)', 'var(--accent-blue)')} title="Edit">
              <Pencil size={14} /> Edit
            </button>
            <button onClick={() => setConfirmDeleteId(selected.id)} style={actionBtn('rgba(239,68,68,0.1)', 'rgba(239,68,68,0.3)', 'var(--accent-red)')} title="Delete">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </header>

        <main style={contentMain}>
          <PlanRenderer
            planId={selected.id}
            planText={selected.content}
            daysLeft={dl}
            exam={selected.exam}
            onLearnTopic={onLearnTopic}
          />
        </main>

        {modal && (
          <StudyPlannerModal
            onClose={handleModalClose}
            initialPlan={modal.mode === 'edit' ? modal.plan : null}
          />
        )}

        {confirmDeleteId === selected.id && (
          <DeleteDialog
            onCancel={() => setConfirmDeleteId(null)}
            onConfirm={() => handleDelete(selected.id)}
          />
        )}
      </div>
    );
  }

  // ── List view ───────────────────────────────────────────────────────────────
  return (
    <div style={pageWrap}>
      <header style={headerBar}>
        <button onClick={onBack} style={backBtn} title="Back to home">
          <ArrowLeft size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: 'var(--accent-blue)', padding: '0.45rem', borderRadius: '8px' }}>
            <CalendarDays size={16} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Study Dashboard</h1>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {plans.length === 0
                ? 'No plans yet'
                : `${plans.length} plan${plans.length === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <button onClick={() => setModal({ mode: 'new' })} style={actionBtn('rgba(16,185,129,0.1)', 'rgba(16,185,129,0.3)', 'var(--accent-green)')} title="Create a new plan">
            <Plus size={14} /> New Plan
          </button>
        </div>
      </header>

      <main style={contentMain}>
        {plans.length === 0 ? (
          <div style={emptyWrap}>
            <BookOpen size={48} style={{ color: 'var(--text-secondary)', opacity: 0.3, marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: '0 0 0.5rem' }}>No Study Plans Yet</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', lineHeight: 1.5 }}>
              Create a personalised AI study plan to track your progress and study smarter. You can keep multiple plans (one per exam) and switch between them anytime.
            </p>
            <button
              onClick={() => setModal({ mode: 'new' })}
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
        ) : (
          <div style={cardGrid}>
            {plans.map((plan) => {
              const dl = daysLeftOf(plan);
              const dlColor = dl == null ? 'var(--text-secondary)'
                : dl < 0 ? 'var(--text-secondary)'
                : dl < 30 ? 'var(--accent-red)'
                : dl < 90 ? '#F59E0B'
                : 'var(--accent-green)';
              return (
                <div
                  key={plan.id}
                  style={planCard}
                  onClick={() => setSelectedId(plan.id)}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ background: 'rgba(59,130,246,0.15)', padding: '0.55rem', borderRadius: '10px', flexShrink: 0 }}>
                      <CalendarDays size={18} color="var(--accent-blue)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, lineHeight: 1.2 }}>{plan.exam}</h3>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        Generated {formatGenerated(plan.generatedAt)}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                    <span style={statPill}>
                      <span style={{ color: dlColor, fontWeight: 700 }}>
                        {dl == null ? '—' : dl < 0 ? 'Past exam' : `${dl}d left`}
                      </span>
                    </span>
                    <span style={statPill}>{plan.dailyHours}h/day</span>
                    {plan.weakSubjects.length > 0 && (
                      <span style={statPill}>
                        {plan.weakSubjects.length} weak {plan.weakSubjects.length === 1 ? 'area' : 'areas'}
                      </span>
                    )}
                  </div>

                  {plan.weakSubjects.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.85rem' }}>
                      {plan.weakSubjects.slice(0, 4).map((s) => (
                        <span key={s} style={subjBadge}>{s}</span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto' }}>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedId(plan.id); }} style={cardBtn('var(--accent-blue)')}>
                      <Eye size={13} /> Open
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setModal({ mode: 'edit', plan }); }} style={cardBtn('var(--text-secondary)')}>
                      <Pencil size={13} /> Edit
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(plan.id); }} style={{ ...cardBtn('var(--accent-red)'), marginLeft: 'auto' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {modal && (
        <StudyPlannerModal
          onClose={handleModalClose}
          initialPlan={modal.mode === 'edit' ? modal.plan : null}
        />
      )}

      {confirmDeleteId && (
        <DeleteDialog
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => handleDelete(confirmDeleteId)}
        />
      )}
    </div>
  );
};

// ── Reusable confirm dialog ───────────────────────────────────────────────────
const DeleteDialog: React.FC<{ onCancel: () => void; onConfirm: () => void }> = ({ onCancel, onConfirm }) => (
  <div style={confirmOverlay} onClick={onCancel}>
    <div style={confirmDialog} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
        <div style={{ background: 'rgba(239,68,68,0.15)', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
          <Trash2 size={18} color="var(--accent-red)" />
        </div>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Delete this plan?</h3>
      </div>
      <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        This will permanently remove the plan and any progress checkmarks. This can't be undone.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={cancelBtn}>Cancel</button>
        <button onClick={onConfirm} style={dangerBtn}>Delete</button>
      </div>
    </div>
  </div>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const pageWrap: React.CSSProperties = {
  display: 'flex', flexDirection: 'column',
  minHeight: '100vh', width: '100vw',
  background: 'var(--bg-primary)',
  backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% 10%, rgba(59,130,246,0.05) 0%, transparent 60%)',
};
const headerBar: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.75rem',
  padding: '1rem 2rem',
  background: 'var(--bg-secondary)',
  borderBottom: '1px solid var(--border-color)',
  flexShrink: 0,
};
const backBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '34px', height: '34px', borderRadius: '10px',
  background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
  cursor: 'pointer', color: 'var(--text-secondary)',
};
const contentMain: React.CSSProperties = {
  flex: 1, overflowY: 'auto',
  padding: '1.5rem 2rem',
  maxWidth: '1300px', width: '100%',
  margin: '0 auto',
};
const emptyWrap: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  height: '60vh', textAlign: 'center',
};
const cardGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '1rem',
  alignItems: 'stretch',
};
const planCard: React.CSSProperties = {
  display: 'flex', flexDirection: 'column',
  padding: '1.1rem',
  borderRadius: '14px',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  cursor: 'pointer',
  transition: 'border-color 0.15s, transform 0.15s',
};
const statPill: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
  padding: '0.25rem 0.6rem', borderRadius: '999px',
  background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
  fontSize: '0.72rem', color: 'var(--text-secondary)',
};
const subjBadge: React.CSSProperties = {
  padding: '0.15rem 0.55rem', borderRadius: '6px',
  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
  color: 'var(--accent-red)', fontSize: '0.68rem', fontWeight: 600,
};
const cardBtn = (color: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
  padding: '0.4rem 0.7rem', borderRadius: '8px',
  background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
  color, fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer',
});
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
