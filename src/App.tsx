import { useState } from 'react';
import { SearchHome } from './components/Home/SearchHome';
import { DynamicWorkspace } from './components/Simulation/DynamicWorkspace';
import { TutorPanel } from './components/Tutor/TutorPanel';
import { StudyPlannerModal } from './components/Planner/StudyPlannerModal';
import { StudyDashboard } from './components/Planner/StudyDashboard';
import { TestAnalysisModal } from './components/TestAnalysis/TestAnalysisModal';
import { AuthModal } from './components/Auth/AuthModal';
import { useAuth } from './contexts/AuthContext';
import { AiService, type LearningModule } from './services/AiService';
import { recordStudySession } from './services/studyDataService';
import { BrainCircuit, ArrowLeft, Bot, CalendarDays, FlaskConical, X, PanelRightClose, PanelRightOpen } from 'lucide-react';
import './index.css';

// Touch device = mobile regardless of orientation (portrait or landscape)
const isMobileDevice = () => navigator.maxTouchPoints > 0;

function App() {
  const { user, loading } = useAuth();
  const [activeModule, setActiveModule] = useState<LearningModule | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [studentState, setStudentState] = useState<Record<string, unknown>>({});
  const [showPlanner, setShowPlanner] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAnalyser, setShowAnalyser] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);   // animation state
  const [tutorMounted, setTutorMounted] = useState(false); // DOM presence
  const [desktopPanelOpen, setDesktopPanelOpen] = useState(true);
  const isMobile = isMobileDevice();

  const openTutor = () => {
    setTutorMounted(true);
    // tiny delay so the element is in DOM before we start the transition
    requestAnimationFrame(() => requestAnimationFrame(() => setTutorOpen(true)));
  };

  const closeTutor = () => {
    setTutorOpen(false);
    // keep in DOM until slide-down animation completes, then remove
    setTimeout(() => setTutorMounted(false), 350);
  };

  const handleModuleLoad = (module: LearningModule) => {
    recordStudySession();
    setStudentState({});
    setTutorOpen(false);
    setTutorMounted(false);
    setActiveModule(module);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', background: 'var(--bg-primary)' }}>
        <div className="animate-pulse" style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Loading...</div>
      </div>
    );
  }

  const handleLearnTopic = async (topic: string) => {
    // Keep showDashboard=true so Back from lesson returns to dashboard
    try {
      const module = await AiService.searchTopic(topic);
      handleModuleLoad(module);
    } catch (e) {
      console.error('Failed to load topic:', e);
    }
  };

  const requireAuth = (action: () => void) => {
    if (!user) {
      setShowAuth(true);
    } else {
      action();
    }
  };

  if (showDashboard && !activeModule) {
    return (
      <StudyDashboard
        onBack={() => setShowDashboard(false)}
        onLearnTopic={handleLearnTopic}
      />
    );
  }

  if (!activeModule) {
    return (
      <>
        <SearchHome
          onModuleLoad={handleModuleLoad}
          onOpenPlanner={() => requireAuth(() => setShowPlanner(true))}
          onOpenDashboard={() => requireAuth(() => setShowDashboard(true))}
          onOpenAnalyser={() => requireAuth(() => setShowAnalyser(true))}
          onOpenAuth={() => setShowAuth(true)}
        />
        {showPlanner && <StudyPlannerModal onClose={() => setShowPlanner(false)} />}
        {showAnalyser && <TestAnalysisModal onClose={() => setShowAnalyser(false)} />}
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
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

            {/* Tutor overlay — only mounted when needed, slides up on open */}
            {tutorMounted && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 50, pointerEvents: tutorOpen ? 'all' : 'none' }}>
                {/* Dim backdrop */}
                <div onClick={closeTutor} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', opacity: tutorOpen ? 1 : 0, transition: 'opacity 0.25s ease' }} />

                {/* Sheet — slides up from bottom */}
                <div style={{
                  position: 'absolute', left: 0, right: 0, bottom: 0, height: '90%',
                  background: 'var(--bg-secondary)', borderRadius: '20px 20px 0 0',
                  display: 'flex', flexDirection: 'column', overflow: 'hidden',
                  transform: tutorOpen ? 'translateY(0)' : 'translateY(100%)',
                  transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
                  boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem 0', flexShrink: 0 }}>
                    <div style={{ width: '40px', height: '4px', background: 'var(--border-color)', borderRadius: '2px', margin: '0 auto' }} />
                    <button onClick={closeTutor} style={{ position: 'absolute', right: '1rem', top: '0.75rem', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <X size={14} />
                    </button>
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <TutorPanel studentState={studentState} goal={activeModule.goal} topic={activeModule.topic} articleDescription={activeModule.articleDescription} articleImage={activeModule.articleImage} articleUrl={activeModule.articleUrl} searchResults={activeModule.searchResults} />
                  </div>
                </div>
              </div>
            )}

            {/* Floating AI Tutor button — always visible when panel is closed */}
            {!tutorOpen && (
              <button onClick={openTutor} style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 40, width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(139,92,246,0.5)', animation: 'fabPulse 2.5s ease-in-out infinite' }} title="Open AI Tutor">
                <Bot size={24} color="white" />
              </button>
            )}
          </>
        ) : (
          <>
            {/* Desktop: side-by-side with collapsible panel */}
            <div style={{ flex: 1, position: 'relative', overflow: 'auto', background: 'var(--bg-primary)' }}>
              <DynamicWorkspace module={activeModule} onStateChange={setStudentState} />
            </div>

            {/* Tutor panel — slides in/out */}
            <div style={{
              position: 'relative',
              width: desktopPanelOpen ? '420px' : '0px',
              minWidth: desktopPanelOpen ? '350px' : '0px',
              maxWidth: '500px',
              overflow: 'hidden',
              borderLeft: desktopPanelOpen ? '1px solid var(--border-color)' : 'none',
              background: 'var(--bg-secondary)',
              boxShadow: desktopPanelOpen ? '-10px 0 30px rgba(0,0,0,0.2)' : 'none',
              zIndex: 5,
              display: 'flex',
              flexDirection: 'column',
              transition: 'width 0.3s cubic-bezier(0.32, 0.72, 0, 1), min-width 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
            }}>
              {/* Collapse button inside panel */}
              {desktopPanelOpen && (
                <button
                  onClick={() => setDesktopPanelOpen(false)}
                  title="Collapse panel"
                  style={{
                    position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 10,
                    width: '30px', height: '30px', borderRadius: '8px',
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <PanelRightClose size={14} />
                </button>
              )}
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: '350px' }}>
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

            {/* Expand button — visible when panel is collapsed */}
            {!desktopPanelOpen && (
              <button
                onClick={() => setDesktopPanelOpen(true)}
                title="Open AI Tutor"
                style={{
                  position: 'fixed', right: 0, top: '50%', transform: 'translateY(-50%)',
                  zIndex: 40, width: '40px', height: '80px',
                  borderRadius: '12px 0 0 12px',
                  background: 'linear-gradient(180deg, var(--accent-purple), var(--accent-blue))',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  boxShadow: '-4px 0 20px rgba(139,92,246,0.4)',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.width = '46px')}
                onMouseLeave={e => (e.currentTarget.style.width = '40px')}
              >
                <Bot size={18} color="white" />
                <PanelRightOpen size={14} color="white" />
              </button>
            )}
          </>
        )}
      </main>

      {showPlanner && <StudyPlannerModal onClose={() => setShowPlanner(false)} />}
      {showAnalyser && <TestAnalysisModal onClose={() => setShowAnalyser(false)} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}

export default App;
