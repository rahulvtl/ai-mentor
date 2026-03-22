import { useState, useEffect } from 'react';
import { SearchHome } from './components/Home/SearchHome';
import { DynamicWorkspace } from './components/Simulation/DynamicWorkspace';
import { TutorPanel } from './components/Tutor/TutorPanel';
import { StudyPlannerModal } from './components/Planner/StudyPlannerModal';
import { TestAnalysisModal } from './components/TestAnalysis/TestAnalysisModal';
import type { LearningModule } from './services/AiService';
import { recordStudySession } from './services/studyDataService';
import { BrainCircuit, ArrowLeft, Bot, CalendarDays, FlaskConical, X } from 'lucide-react';
import './index.css';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 900);
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
  const [tutorOpen, setTutorOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleModuleLoad = (module: LearningModule) => {
    recordStudySession();
    setStudentState({});
    setTutorOpen(false);
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
        <button
          className="btn"
          style={{ padding: '0.4rem', background: 'transparent', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          onClick={() => setActiveModule(null)}
          title="Back to Search"
        >
          <ArrowLeft size={isMobile ? 20 : 24} color="var(--text-secondary)" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <div style={{ background: 'var(--accent-blue)', padding: isMobile ? '0.35rem' : '0.5rem', borderRadius: '8px' }}>
            <BrainCircuit size={isMobile ? 18 : 24} color="white" />
          </div>
          {!isMobile && (
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>AI MENTOR</h1>
          )}
        </div>

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

        {/* Desktop buttons */}
        <div className="desktop-only" style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Current Topic:</span>
          <button onClick={() => setShowPlanner(true)} style={{ padding: '0.35rem 0.75rem', borderRadius: '20px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: 'var(--accent-blue)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
            Study Planner
          </button>
          <button onClick={() => setShowAnalyser(true)} style={{ padding: '0.35rem 0.75rem', borderRadius: '20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--accent-red)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
            Analyse Test
          </button>
        </div>

        {/* Mobile icon buttons */}
        {isMobile && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
            <button onClick={() => setShowPlanner(true)} style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: 'var(--accent-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Study Planner">
              <CalendarDays size={16} />
            </button>
            <button onClick={() => setShowAnalyser(true)} style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--accent-red)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Analyse Test">
              <FlaskConical size={16} />
            </button>
          </div>
        )}
      </header>

      {/* ── Main content ── */}
      <main style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>

        {isMobile ? (
          <>
            {/* Full-screen workspace */}
            <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-primary)', overflow: 'auto' }}>
              <DynamicWorkspace module={activeModule} onStateChange={setStudentState} />
            </div>

            {/* Tutor overlay — slides up from bottom when open */}
            <div style={{
              position: 'fixed', inset: 0, zIndex: 50,
              pointerEvents: tutorOpen ? 'all' : 'none',
            }}>
              {/* Dim backdrop */}
              <div
                onClick={() => setTutorOpen(false)}
                style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.6)',
                  opacity: tutorOpen ? 1 : 0,
                  transition: 'opacity 0.25s ease',
                }}
              />

              {/* Tutor panel sheet — slides up */}
              <div style={{
                position: 'absolute', left: 0, right: 0, bottom: 0,
                height: '90%',
                background: 'var(--bg-secondary)',
                borderRadius: '20px 20px 0 0',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
                transform: tutorOpen ? 'translateY(0)' : 'translateY(100%)',
                transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
              }}>
                {/* Drag handle + close */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem 0', flexShrink: 0 }}>
                  <div style={{ width: '40px', height: '4px', background: 'var(--border-color)', borderRadius: '2px', margin: '0 auto' }} />
                  <button
                    onClick={() => setTutorOpen(false)}
                    style={{ position: 'absolute', right: '1rem', top: '0.75rem', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  >
                    <X size={14} />
                  </button>
                </div>

                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
              </div>
            </div>

            {/* Floating AI Tutor button */}
            {!tutorOpen && (
              <button
                onClick={() => setTutorOpen(true)}
                style={{
                  position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 40,
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(139,92,246,0.5)',
                  animation: 'fabPulse 2.5s ease-in-out infinite',
                }}
                title="Open AI Tutor"
              >
                <Bot size={24} color="white" />
              </button>
            )}
          </>
        ) : (
          <>
            {/* Desktop: side-by-side */}
            <div style={{ flex: '1 1 60%', position: 'relative', overflow: 'auto', background: 'var(--bg-primary)' }}>
              <DynamicWorkspace module={activeModule} onStateChange={setStudentState} />
            </div>
            <div className="animate-slide-in-right" style={{ flex: '1 1 40%', flexBasis: '40%', minWidth: '350px', maxWidth: '500px', overflow: 'hidden', borderLeft: '1px solid var(--border-color)', background: 'var(--bg-secondary)', boxShadow: '-10px 0 30px rgba(0,0,0,0.2)', zIndex: 5, display: 'flex', flexDirection: 'column' }}>
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

      {showPlanner && <StudyPlannerModal onClose={() => setShowPlanner(false)} />}
      {showAnalyser && <TestAnalysisModal onClose={() => setShowAnalyser(false)} />}
    </div>
  );
}

export default App;
