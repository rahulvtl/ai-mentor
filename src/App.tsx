import { useState, useEffect } from 'react';
import { SearchHome } from './components/Home/SearchHome';
import { DynamicWorkspace } from './components/Simulation/DynamicWorkspace';
import { TutorPanel } from './components/Tutor/TutorPanel';
import { StudyPlannerModal } from './components/Planner/StudyPlannerModal';
import { TestAnalysisModal } from './components/TestAnalysis/TestAnalysisModal';
import type { LearningModule } from './services/AiService';
import { recordStudySession } from './services/studyDataService';
import { BrainCircuit, ArrowLeft, BookOpen, Bot, CalendarDays, FlaskConical } from 'lucide-react';
import './index.css';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

function App() {
  const [activeModule, setActiveModule] = useState<LearningModule | null>(null);
  const [studentState, setStudentState] = useState<Record<string, unknown>>({});
  const [showPlanner, setShowPlanner] = useState(false);
  const [showAnalyser, setShowAnalyser] = useState(false);
  const [mobilePanelView, setMobilePanelView] = useState<'workspace' | 'tutor'>('workspace');
  const isMobile = useIsMobile();

  const handleModuleLoad = (module: LearningModule) => {
    recordStudySession();
    setStudentState({});
    setMobilePanelView('workspace');
    setActiveModule(module);
  };

  if (!activeModule) {
    return (
      <>
        <SearchHome
          onModuleLoad={handleModuleLoad}
          onOpenPlanner={() => setShowPlanner(true)}
          onOpenAnalyser={() => setShowAnalyser(true)}
        />
        {showPlanner && <StudyPlannerModal onClose={() => setShowPlanner(false)} />}
        {showAnalyser && <TestAnalysisModal onClose={() => setShowAnalyser(false)} />}
      </>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }} className="animate-fade-in">

      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center',
        padding: isMobile ? '0.65rem 1rem' : '1rem 2rem',
        background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)',
        gap: '0.75rem', boxShadow: 'var(--shadow-panel)', zIndex: 10, flexShrink: 0,
      }}>
        {/* Back button */}
        <button
          className="btn"
          style={{ padding: '0.4rem', background: 'transparent', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          onClick={() => setActiveModule(null)}
          title="Back to Search"
        >
          <ArrowLeft size={isMobile ? 20 : 24} color="var(--text-secondary)" />
        </button>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <div style={{ background: 'var(--accent-blue)', padding: isMobile ? '0.35rem' : '0.5rem', borderRadius: '8px' }}>
            <BrainCircuit size={isMobile ? 18 : 24} color="white" />
          </div>
          {!isMobile && (
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>AI MENTOR</h1>
          )}
        </div>

        {/* Topic chip */}
        <span style={{
          fontWeight: 600, background: 'var(--bg-tertiary)',
          padding: isMobile ? '0.2rem 0.6rem' : '0.25rem 0.75rem',
          borderRadius: '20px', border: '1px solid var(--border-color)',
          fontSize: isMobile ? '0.75rem' : '0.875rem',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          maxWidth: isMobile ? '130px' : '240px',
        }}>
          {activeModule.topic}
        </span>

        {/* Desktop action buttons */}
        <div className="desktop-only" style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Current Topic:</span>
          <button
            onClick={() => setShowPlanner(true)}
            style={{ padding: '0.35rem 0.75rem', borderRadius: '20px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: 'var(--accent-blue)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Study Planner
          </button>
          <button
            onClick={() => setShowAnalyser(true)}
            style={{ padding: '0.35rem 0.75rem', borderRadius: '20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--accent-red)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Analyse Test
          </button>
        </div>

        {/* Mobile action buttons (icon-only) */}
        {isMobile && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setShowPlanner(true)}
              style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: 'var(--accent-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Study Planner"
            >
              <CalendarDays size={16} />
            </button>
            <button
              onClick={() => setShowAnalyser(true)}
              style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--accent-red)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Analyse Test"
            >
              <FlaskConical size={16} />
            </button>
          </div>
        )}
      </header>

      {/* ── Main content ── */}
      <main style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>

        {/* Desktop: side-by-side | Mobile: show active panel only */}
        {isMobile ? (
          <>
            {/* Workspace panel */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'var(--bg-primary)',
              overflow: 'auto',
              transform: mobilePanelView === 'workspace' ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.25s ease',
            }}>
              <DynamicWorkspace module={activeModule} onStateChange={setStudentState} />
            </div>

            {/* Tutor panel */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'var(--bg-secondary)',
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              transform: mobilePanelView === 'tutor' ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.25s ease',
            }}>
              <TutorPanel
                studentState={studentState}
                goal={activeModule.goal}
                topic={activeModule.topic}
                articleDescription={activeModule.articleDescription}
                articleImage={activeModule.articleImage}
                articleUrl={activeModule.articleUrl}
                searchResults={activeModule.searchResults}
              />
            </div>
          </>
        ) : (
          <>
            {/* Desktop workspace */}
            <div style={{ flex: '1 1 60%', position: 'relative', overflow: 'auto', background: 'var(--bg-primary)' }}>
              <DynamicWorkspace module={activeModule} onStateChange={setStudentState} />
            </div>

            {/* Desktop tutor panel */}
            <div className="animate-slide-in-right" style={{
              flex: '1 1 40%', flexBasis: '40%', minWidth: '350px', maxWidth: '500px',
              overflow: 'hidden', borderLeft: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)', boxShadow: '-10px 0 30px rgba(0,0,0,0.2)',
              zIndex: 5, display: 'flex', flexDirection: 'column',
            }}>
              <TutorPanel
                studentState={studentState}
                goal={activeModule.goal}
                topic={activeModule.topic}
                articleDescription={activeModule.articleDescription}
                articleImage={activeModule.articleImage}
                articleUrl={activeModule.articleUrl}
                searchResults={activeModule.searchResults}
              />
            </div>
          </>
        )}
      </main>

      {/* ── Mobile bottom tab bar ── */}
      {isMobile && (
        <nav className="mobile-bottom-nav" style={{
          background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)',
          flexShrink: 0, zIndex: 20,
        }}>
          <button
            onClick={() => setMobilePanelView('workspace')}
            style={{
              flex: 1, padding: '0.75rem', background: 'transparent', border: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
              color: mobilePanelView === 'workspace' ? 'var(--accent-blue)' : 'var(--text-secondary)',
              cursor: 'pointer', borderTop: mobilePanelView === 'workspace' ? '2px solid var(--accent-blue)' : '2px solid transparent',
              fontSize: '0.65rem', fontWeight: mobilePanelView === 'workspace' ? 700 : 400,
              transition: 'color 0.15s',
            }}
          >
            <BookOpen size={20} />
            Workspace
          </button>
          <button
            onClick={() => setMobilePanelView('tutor')}
            style={{
              flex: 1, padding: '0.75rem', background: 'transparent', border: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
              color: mobilePanelView === 'tutor' ? 'var(--accent-purple)' : 'var(--text-secondary)',
              cursor: 'pointer', borderTop: mobilePanelView === 'tutor' ? '2px solid var(--accent-purple)' : '2px solid transparent',
              fontSize: '0.65rem', fontWeight: mobilePanelView === 'tutor' ? 700 : 400,
              transition: 'color 0.15s',
            }}
          >
            <Bot size={20} />
            AI Tutor
          </button>
        </nav>
      )}

      {showPlanner && <StudyPlannerModal onClose={() => setShowPlanner(false)} />}
      {showAnalyser && <TestAnalysisModal onClose={() => setShowAnalyser(false)} />}
    </div>
  );
}

export default App;
