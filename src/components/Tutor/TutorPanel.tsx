import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Bot, Send, ExternalLink, BookOpen, MessageSquare, Loader2, Zap, BrainCog, CheckCircle2, XCircle, ChevronDown, Camera, Mic, MicOff, Volume2, X as XIcon, Layers, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react';
import {
  streamTutorResponse,
  streamVisionResponse,
  transcribeAudio,
  generateFlashcards,
  generateAIPYQs,
  buildStudentStateContext,
  type ChatMessage,
  type ExamType,
} from '../../services/claudeService';

interface Flashcard { id: string; question: string; answer: string; }
import type { SearchResult } from '../../services/AiService';
import { getPYQsForTopic, type PYQQuestion } from '../../data/pyqBank';
import { recordTopicQuestion } from '../../services/studyDataService';

interface TutorPanelProps {
  studentState: Record<string, unknown>;
  goal: string;
  topic: string;
  articleDescription?: string;
  articleImage?: string;
  articleUrl?: string;
  searchResults?: SearchResult[];
}

function getChipsForTopic(topic: string): string[] {
  const t = topic.toLowerCase();

  // ── Biology ──────────────────────────────────────────────────────────────
  if (t.includes('heart') || t.includes('cardiac'))
    return ['How does the heart pump blood?', 'What are the 4 chambers?', 'Give me a practice question', 'What causes heart disease?'];
  if (t.includes('cell') || t.includes('mitosis') || t.includes('meiosis'))
    return ['What is the difference between mitosis and meiosis?', 'Explain the cell cycle simply', 'Give me a practice question', 'What organelle does what?'];
  if (t.includes('dna') || t.includes('gene') || t.includes('genetics'))
    return ['How does DNA replication work?', 'What is the central dogma?', 'Give me a genetics problem', 'What is a mutation?'];
  if (t.includes('photosynthesis'))
    return ['What is the equation for photosynthesis?', 'Explain the light and dark reactions', 'Give me a practice question', "What's the real-world importance?"];
  if (t.includes('blood') || t.includes('circulat'))
    return ['What do red and white blood cells do?', 'How does blood clotting work?', 'Give me a practice question', 'What is blood pressure?'];
  if (t.includes('brain') || t.includes('neuron') || t.includes('nervous'))
    return ['How do neurons transmit signals?', 'What are the parts of the brain?', 'Give me a practice question', 'What is a reflex arc?'];
  if (t.includes('evolution') || t.includes('darwin') || t.includes('natural selection'))
    return ['Explain natural selection simply', 'What is the evidence for evolution?', 'Give me a practice question', 'What is genetic drift?'];

  // ── Physics ───────────────────────────────────────────────────────────────
  if (t.includes('newton') || t.includes('force') || t.includes('motion'))
    return ["State Newton's 3 laws simply", 'Give me a force problem to solve', 'What is the real-world use of F = ma?', 'What is inertia?'];
  if (t.includes('gravity') || t.includes('gravitat'))
    return ['Why do objects fall at the same rate?', 'What is escape velocity?', 'Give me a practice problem', "How does gravity affect time?"];
  if (t.includes('wave') || t.includes('sound') || t.includes('light') || t.includes('optic'))
    return ['What is the difference between transverse and longitudinal waves?', 'How does reflection work?', 'Give me a wave problem', 'What is the Doppler effect?'];
  if (t.includes('electric') || t.includes('circuit') || t.includes('current') || t.includes('voltage'))
    return ["What is Ohm's Law?", 'How does a circuit work?', 'Give me a circuit problem', 'What is the difference between AC and DC?'];
  if (t.includes('magnet') || t.includes('electromagn'))
    return ['How does electromagnetism work?', "What is Faraday's Law?", 'Give me a practice question', 'What is a magnetic field?'];
  if (t.includes('thermodynamic') || t.includes('heat') || t.includes('temperature') || t.includes('entropy'))
    return ['What are the laws of thermodynamics?', 'What is entropy in simple terms?', 'Give me a heat transfer problem', 'How does a heat engine work?'];
  if (t.includes('quantum'))
    return ['Explain quantum superposition simply', "What is Heisenberg's uncertainty principle?", 'Give me a practice question', "What is wave-particle duality?"];
  if (t.includes('projectile'))
    return ['What equations describe projectile motion?', 'Give me a projectile problem', 'What angle gives maximum range?', 'How does air resistance affect it?'];
  if (t.includes('energy') || t.includes('kinetic') || t.includes('potential'))
    return ['What is the difference between KE and PE?', 'Explain conservation of energy', 'Give me an energy problem', 'What is power?'];
  if (/\bwork\b/.test(t) && (t.includes('physic') || t.includes('mechan') || t.includes('energy')))
    return ['What is the work-energy theorem?', 'Give me a work problem', 'When is work zero, positive, or negative?', 'What is the unit of work and how does it relate to power?'];

  // ── Chemistry ─────────────────────────────────────────────────────────────
  if (t.includes('atom') || t.includes('electron') || t.includes('proton') || t.includes('nucleus'))
    return ['Describe the structure of an atom', 'What are electron shells?', 'Give me a practice question', 'What is atomic number vs mass number?'];
  if (t.includes('periodic') || t.includes('element'))
    return ['How is the periodic table organised?', 'What are groups and periods?', 'Give me a practice question', 'What are the most reactive elements?'];
  if (t.includes('bond') || t.includes('ionic') || t.includes('covalent'))
    return ['What is the difference between ionic and covalent bonds?', 'Why do atoms bond?', 'Give me a bonding question', 'What is electronegativity?'];
  if (t.includes('acid') || t.includes('alkali') || /\bbase\b/.test(t) || /\bph\b/.test(t))
    return ['What is the pH scale?', 'What makes something an acid or base?', 'Give me a neutralisation problem', 'What is a buffer?'];
  if (t.includes('reaction') || t.includes('chemical') || t.includes('stoichiom'))
    return ['How do I balance a chemical equation?', 'What are the types of chemical reactions?', 'Give me a stoichiometry problem', 'What is a catalyst?'];
  if (t.includes('organic') || t.includes('carbon') || t.includes('hydrocarbon'))
    return ['What are hydrocarbons?', 'What is the difference between alkanes and alkenes?', 'Give me a naming problem', 'What is isomerism?'];

  // ── Mathematics ───────────────────────────────────────────────────────────
  if (t.includes('pythagoras') || t.includes('triangle') || t.includes('trigonometry') || t.includes('sin') || t.includes('cos'))
    return ['Explain the Pythagorean theorem simply', 'Give me a triangle problem', 'What are sin, cos, and tan?', 'Where is trig used in real life?'];
  if (t.includes('algebra') || t.includes('equation') || t.includes('quadratic'))
    return ['How do I solve a quadratic equation?', 'Give me an algebra problem', 'What is the quadratic formula?', 'How do I factorise expressions?'];
  if (t.includes('calculus') || t.includes('derivative') || t.includes('integral') || t.includes('differentiat'))
    return ['What is a derivative in simple terms?', 'Give me a differentiation problem', 'How is calculus used in real life?', 'What is the difference between differentiation and integration?'];
  if (t.includes('probability') || t.includes('statistic') || t.includes('mean') || t.includes('average'))
    return ['What is the difference between mean, median, and mode?', 'Give me a probability problem', 'What is standard deviation?', 'What is conditional probability?'];
  if (t.includes('vector') || t.includes('angle'))
    return ['What is the difference between a vector and a scalar?', 'How do I add two vectors?', 'Give me a vector problem', 'What is the dot product?'];
  if (t.includes('area') || t.includes('rectangle') || t.includes('geometry'))
    return ['How do I calculate the area of different shapes?', 'Give me a geometry problem', 'What is the difference between perimeter and area?', 'How is geometry used in architecture?'];
  if (t.includes('matrix') || t.includes('matrices'))
    return ['What is matrix multiplication?', 'Give me a matrix problem', 'What is a determinant?', 'What are matrices used for?'];
  if (/\bpi\b/.test(t) || t.includes('circle'))
    return ['Why is pi irrational?', 'Give me a circle problem', 'What is the formula for circumference and area?', 'Where does pi appear in nature?'];

  // ── Generic fallback with topic name embedded ─────────────────────────────
  return [
    `Explain ${topic} simply`,
    `Give me a practice question on ${topic}`,
    `What is the real-world use of ${topic}?`,
    `What is the most important formula in ${topic}?`,
  ];
}

let msgCounter = 0;
const nextId = () => `msg-${++msgCounter}-${Date.now()}`;

export const TutorPanel: React.FC<TutorPanelProps> = ({
  studentState,
  topic,
  articleDescription,
  articleImage,
  articleUrl,
  searchResults,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'learn' | 'practice' | 'cards'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [socraticMode, setSocraticMode] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  // ── AI PYQ state ──────────────────────────────────────────────────────────
  const [examType, setExamType] = useState<ExamType>('General');
  const [aiPYQs, setAiPYQs] = useState<PYQQuestion[]>([]);
  const [isGeneratingPYQs, setIsGeneratingPYQs] = useState(false);
  const [pyqScore, setPyqScore] = useState({ correct: 0, attempted: 0 });
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [curatedCount, setCuratedCount] = useState(0);

  // Reset chat when topic changes
  useEffect(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setInputValue('');
    setPendingImage(null);
    setFlashcards([]);
    setCardIndex(0);
    setIsFlipped(false);
    setKnownIds(new Set());
    setAiPYQs([]);
    setCuratedCount(0);
    setPyqScore({ correct: 0, attempted: 0 });
    setMessages([
      {
        id: nextId(),
        role: 'assistant',
        content: `Hi! I'm your AI tutor. You're exploring **${topic}**.\n\nAsk me anything, or pick a quick question below to get started.`,
      },
    ]);
  }, [topic]);

  const loadAIPYQs = useCallback(async (type: ExamType) => {
    setPyqScore({ correct: 0, attempted: 0 });

    // 1. Show curated past-paper-style questions immediately so the user has
    //    something to work on while the LLM streams. These come from the
    //    hand-vetted bank in src/data/pyqBank.ts and are real exam-style.
    const curated = getPYQsForTopic(topic);
    setCuratedCount(curated.length);
    setAiPYQs(curated);
    setIsGeneratingPYQs(true);

    // 2. Top up with AI-generated questions in the chosen exam style.
    try {
      const results = await generateAIPYQs(topic, articleDescription ?? '', type);
      const aiQuestions: PYQQuestion[] = results.map((q, i) => ({
        id: `ai-${i}`,
        subject: q.subject as PYQQuestion['subject'],
        topic,
        keywords: [],
        exam: type === 'JEE' ? 'JEE Main' : type === 'NEET' ? 'NEET' : type === 'SSC' ? 'SSC' : type === 'Law' ? 'Law' : type === 'UPSC' ? 'UPSC' : 'General',
        year: new Date().getFullYear(),
        question: q.question,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation,
        difficulty: q.difficulty,
      }));
      setAiPYQs([...curated, ...aiQuestions]);
    } catch {
      // AI failed — keep just the curated set. Don't wipe the user's questions.
    } finally {
      setIsGeneratingPYQs(false);
    }
  }, [topic, articleDescription]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string, imgDataUrl?: string) => {
      const trimmed = text.trim();
      const imageToSend = imgDataUrl ?? pendingImage ?? undefined;
      if (!trimmed && !imageToSend || isStreaming) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userMsg: ChatMessage = {
        id: nextId(),
        role: 'user',
        content: trimmed || '(image)',
        imageDataUrl: imageToSend,
      };
      const assistantMsgId = nextId();
      const assistantMsg: ChatMessage = { id: assistantMsgId, role: 'assistant', content: '', isStreaming: true };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInputValue('');
      setPendingImage(null);
      setIsStreaming(true);

      recordTopicQuestion(topic);

      const onChunk = (chunk: string) =>
        setMessages((prev) => prev.map((m) => m.id === assistantMsgId ? { ...m, content: m.content + chunk } : m));
      const onDone = () => {
        setMessages((prev) => prev.map((m) => m.id === assistantMsgId ? { ...m, isStreaming: false } : m));
        setIsStreaming(false);
      };
      const onError = (error: Error) => {
        setMessages((prev) => prev.map((m) => m.id === assistantMsgId ? { ...m, content: `⚠️ ${error.message}`, isStreaming: false } : m));
        setIsStreaming(false);
      };

      if (imageToSend) {
        await streamVisionResponse(imageToSend, trimmed, topic, onChunk, onDone, onError, controller.signal, language);
      } else {
        const history = [...messages, userMsg];
        const stateCtx = buildStudentStateContext(studentState);
        await streamTutorResponse(history, topic, stateCtx, onChunk, onDone, onError, controller.signal, socraticMode, language);
      }
    },
    [isStreaming, messages, studentState, topic, socraticMode, pendingImage, language]
  );

  // ── Camera / image upload ───────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPendingImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── Voice input ─────────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsTranscribing(true);
        try {
          const text = await transcribeAudio(blob);
          if (text) setInputValue((prev) => prev ? `${prev} ${text}` : text);
        } catch (err) {
          console.error('Transcription failed', err);
        } finally {
          setIsTranscribing(false);
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      alert('Microphone access denied. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
  };

  // ── Flashcard generation ───────────────────────────────────────────────────
  const loadFlashcards = async () => {
    if (isGeneratingCards || flashcards.length > 0) return;
    setIsGeneratingCards(true);
    try {
      const context = articleDescription ?? '';
      const cards = await generateFlashcards(topic, context);
      setFlashcards(cards.map((c, i) => ({ id: `fc-${i}`, ...c })));
      setCardIndex(0);
      setIsFlipped(false);
      setKnownIds(new Set());
    } catch (err) {
      console.error('Flashcard generation failed', err);
    } finally {
      setIsGeneratingCards(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  // ── Shared header ───────────────────────────────────────────────────────────
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: '1.25rem 1.5rem 0',
          borderBottom: '1px solid var(--border-color)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div
            style={{
              background: 'var(--accent-purple)',
              padding: '0.6rem',
              borderRadius: '10px',
              boxShadow: '0 0 14px rgba(139,92,246,0.35)',
              flexShrink: 0,
            }}
          >
            <Bot size={20} color="white" />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>AI Tutor</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0 }}>
              {isStreaming ? (
                <span style={{ color: 'var(--accent-purple)' }}>● Thinking…</span>
              ) : (
                'Ready to help'
              )}
            </p>
          </div>

        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0' }}>
          {([
            { key: 'chat', label: 'Chat', icon: <MessageSquare size={13} /> },
            { key: 'learn', label: 'Learn', icon: <BookOpen size={13} /> },
            { key: 'practice', label: 'Practice', icon: <BrainCog size={13} /> },
            { key: 'cards', label: 'Flashcards', icon: <Layers size={13} /> },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                if (tab.key === 'cards') loadFlashcards();
                if (tab.key === 'practice' && aiPYQs.length === 0 && !isGeneratingPYQs) loadAIPYQs(examType);
              }}
              style={{
                flex: 1,
                padding: '0.55rem 0',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.key
                  ? '2px solid var(--accent-purple)'
                  : '2px solid transparent',
                color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.key ? 600 : 400,
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat Tab ── */}
      {activeTab === 'chat' && (
        <>
          {/* Messages area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.25rem 1.25rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
          >
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Socratic + Language toggles */}
          <div style={{ padding: '0.4rem 1.25rem 0', flexShrink: 0, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSocraticMode((v) => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.35rem 0.75rem', borderRadius: '20px',
                background: socraticMode ? 'rgba(139,92,246,0.15)' : 'var(--bg-tertiary)',
                border: `1px solid ${socraticMode ? 'var(--accent-purple)' : 'var(--border-color)'}`,
                color: socraticMode ? 'var(--accent-purple)' : 'var(--text-secondary)',
                fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <BrainCog size={12} />
              {socraticMode ? 'Socratic ON' : 'Socratic OFF'}
            </button>

            {/* Language toggle */}
            <div style={{ display: 'flex', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '20px', overflow: 'hidden', flexShrink: 0 }}>
              {(['en', 'hi'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    background: language === lang ? 'rgba(59,130,246,0.2)' : 'transparent',
                    border: 'none',
                    color: language === lang ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    fontSize: '0.72rem', fontWeight: language === lang ? 700 : 400,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {lang === 'en' ? '🇬🇧 EN' : '🇮🇳 हिंदी'}
                </button>
              ))}
            </div>
          </div>

          {/* Quick chips */}
          <div
            style={{
              padding: '0.5rem 1.25rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.4rem',
              flexShrink: 0,
            }}
          >
            {getChipsForTopic(topic).map((chip) => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                disabled={isStreaming}
                style={{
                  padding: '0.3rem 0.65rem',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  fontSize: '0.73rem',
                  color: isStreaming ? 'var(--text-secondary)' : 'rgba(255,255,255,0.8)',
                  cursor: isStreaming ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.15s ease',
                  opacity: isStreaming ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isStreaming)
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      'var(--accent-purple)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    'var(--border-color)';
                }}
              >
                <Zap size={10} />
                {chip}
              </button>
            ))}
          </div>

          {/* Input area */}
          <div style={{ padding: '0.75rem 1.25rem 1.25rem', flexShrink: 0 }}>
            {/* Hidden file input for camera/gallery */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {/* Image preview strip */}
            {pendingImage && (
              <div style={{ marginBottom: '0.5rem', position: 'relative', display: 'inline-block' }}>
                <img
                  src={pendingImage}
                  alt="Pending upload"
                  style={{ height: '72px', borderRadius: '8px', border: '1px solid var(--border-color)', objectFit: 'cover' }}
                />
                <button
                  onClick={() => setPendingImage(null)}
                  style={{
                    position: 'absolute', top: '-6px', right: '-6px',
                    background: 'var(--accent-red)', border: 'none', borderRadius: '50%',
                    width: '18px', height: '18px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <XIcon size={10} color="white" />
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.6rem 0.6rem 0.6rem 0.9rem' }}>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isTranscribing ? 'Transcribing…' :
                  isRecording ? 'Recording… click mic to stop' :
                  isStreaming ? 'Waiting for response…' :
                  pendingImage ? 'Ask about this image… or send as-is' :
                  'Ask anything about this topic…'
                }
                disabled={isStreaming || isTranscribing}
                rows={1}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '0.85rem', lineHeight: 1.5, resize: 'none', fontFamily: 'inherit', maxHeight: '100px', overflowY: 'auto' }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = 'auto';
                  el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
                }}
              />

              {/* Camera button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isStreaming}
                title="Upload image / take photo"
                style={{ background: 'transparent', border: 'none', cursor: isStreaming ? 'not-allowed' : 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center', color: pendingImage ? 'var(--accent-blue)' : 'var(--text-secondary)', flexShrink: 0 }}
              >
                <Camera size={17} />
              </button>

              {/* Mic button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isStreaming || isTranscribing}
                title={isRecording ? 'Stop recording' : 'Voice input'}
                style={{ background: isRecording ? 'rgba(239,68,68,0.2)' : 'transparent', border: 'none', cursor: isStreaming || isTranscribing ? 'not-allowed' : 'pointer', padding: '0.3rem', borderRadius: '6px', display: 'flex', alignItems: 'center', color: isRecording ? 'var(--accent-red)' : isTranscribing ? 'var(--accent-blue)' : 'var(--text-secondary)', flexShrink: 0, animation: isRecording ? 'pulse 1.2s ease-in-out infinite' : 'none' }}
              >
                {isTranscribing ? <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> : isRecording ? <MicOff size={17} /> : <Mic size={17} />}
              </button>

              {/* Send button */}
              <button
                onClick={() => sendMessage(inputValue)}
                disabled={isStreaming || (!inputValue.trim() && !pendingImage)}
                style={{ background: isStreaming || (!inputValue.trim() && !pendingImage) ? 'var(--border-color)' : 'var(--accent-purple)', border: 'none', borderRadius: '8px', padding: '0.45rem 0.65rem', cursor: isStreaming || (!inputValue.trim() && !pendingImage) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s ease' }}
              >
                {isStreaming ? <Loader2 size={16} color="white" style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} color="white" />}
              </button>
            </div>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0', textAlign: 'center' }}>
              Shift+Enter for new line · Enter to send · 📷 photo · 🎙 voice
            </p>
          </div>
        </>
      )}

      {/* ── Practice Tab ── */}
      {activeTab === 'practice' && (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Exam type selector */}
          <div style={{ padding: '0.75rem 1.25rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>Exam Style</span>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {(['UPSC', 'SSC', 'NEET', 'JEE', 'Law', 'General'] as ExamType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => { setExamType(type); loadAIPYQs(type); }}
                  style={{
                    padding: '0.28rem 0.7rem', borderRadius: '20px', border: 'none',
                    background: examType === type ? 'var(--accent-purple)' : 'var(--bg-tertiary)',
                    color: examType === type ? 'white' : 'var(--text-secondary)',
                    fontSize: '0.72rem', fontWeight: examType === type ? 700 : 400,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >{type}</button>
              ))}
            </div>
            {/* Score tracker */}
            {pyqScore.attempted > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ height: '4px', flex: 1, background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(pyqScore.correct / pyqScore.attempted) * 100}%`, background: pyqScore.correct / pyqScore.attempted >= 0.6 ? 'var(--accent-green)' : 'var(--accent-red)', borderRadius: '4px', transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {pyqScore.correct}/{pyqScore.attempted} correct
                </span>
              </div>
            )}
          </div>

          {/* Questions area */}
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isGeneratingPYQs && aiPYQs.length === 0 ? (
              // No curated matches and AI still loading -> full loader
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', paddingTop: '3rem' }}>
                <Loader2 size={32} color="var(--accent-purple)" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                  Generating <strong style={{ color: 'white' }}>{examType}</strong> questions on <strong style={{ color: 'white' }}>{topic}</strong>…
                </p>
              </div>
            ) : aiPYQs.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', paddingTop: '3rem' }}>
                <BrainCog size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <p style={{ margin: 0 }}>Could not generate questions.</p>
                <button onClick={() => loadAIPYQs(examType)} style={{ marginTop: '0.75rem', padding: '0.5rem 1.25rem', background: 'var(--accent-purple)', border: 'none', borderRadius: '20px', color: 'white', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                    {curatedCount > 0 && `${curatedCount} past-paper-style`}
                    {curatedCount > 0 && (aiPYQs.length - curatedCount) > 0 && ' + '}
                    {(aiPYQs.length - curatedCount) > 0 && `${aiPYQs.length - curatedCount} AI-generated`}
                    {' '}{examType} Questions
                  </p>
                  <button
                    onClick={() => loadAIPYQs(examType)}
                    disabled={isGeneratingPYQs}
                    style={{ background: 'transparent', border: 'none', cursor: isGeneratingPYQs ? 'default' : 'pointer', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', fontWeight: 600, padding: 0, opacity: isGeneratingPYQs ? 0.5 : 1 }}
                  >
                    <RotateCcw size={11} /> New Set
                  </button>
                </div>
                {aiPYQs.map((q, idx) => (
                  <PYQCard
                    key={q.id}
                    question={q}
                    isCurated={idx < curatedCount}
                    onAnswer={(correct) => setPyqScore((s) => ({ correct: s.correct + (correct ? 1 : 0), attempted: s.attempted + 1 }))}
                  />
                ))}
                {isGeneratingPYQs && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                    <Loader2 size={14} color="var(--accent-purple)" style={{ animation: 'spin 1s linear infinite' }} />
                    Generating more {examType} questions…
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Flashcards Tab ── */}
      {activeTab === 'cards' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.25rem', gap: '1rem', overflow: 'hidden' }}>
          {isGeneratingCards ? (
            /* Loading state */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <Loader2 size={32} color="var(--accent-purple)" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Generating flashcards for <strong style={{ color: 'white' }}>{topic}</strong>…</p>
            </div>
          ) : flashcards.length === 0 ? (
            /* Empty state */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <Layers size={36} color="var(--text-secondary)" style={{ opacity: 0.3 }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Could not generate flashcards.</p>
              <button onClick={loadFlashcards} style={{ padding: '0.5rem 1.25rem', background: 'var(--accent-purple)', border: 'none', borderRadius: '20px', color: 'white', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Progress bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    {knownIds.size} / {flashcards.length} known
                  </span>
                  <button
                    onClick={() => { setCardIndex(0); setIsFlipped(false); setKnownIds(new Set()); }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', padding: 0 }}
                  >
                    <RotateCcw size={11} /> Reset
                  </button>
                </div>
                <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(knownIds.size / flashcards.length) * 100}%`, background: 'var(--accent-green)', borderRadius: '4px', transition: 'width 0.3s ease' }} />
                </div>
              </div>

              {/* Card counter */}
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0, textAlign: 'center' }}>
                Card {cardIndex + 1} of {flashcards.length}
                {knownIds.has(flashcards[cardIndex].id) && <span style={{ marginLeft: '0.5rem', color: 'var(--accent-green)', fontWeight: 700 }}>✓ Known</span>}
              </p>

              {/* Flip card */}
              <div
                className="flip-card"
                onClick={() => setIsFlipped((v) => !v)}
                style={{ flex: 1, maxHeight: '260px', cursor: 'pointer', perspective: '1000px' }}
              >
                <div className={`flip-card-inner${isFlipped ? ' flipped' : ''}`}>
                  {/* Front — Question */}
                  <div className="flip-card-front" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--accent-purple)', marginBottom: '0.75rem' }}>Question</span>
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'white', margin: 0, flex: 1, display: 'flex', alignItems: 'center' }}>
                      {flashcards[cardIndex].question}
                    </p>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '1rem', textAlign: 'center' }}>Tap to reveal answer</span>
                  </div>
                  {/* Back — Answer */}
                  <div className="flip-card-back" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid var(--accent-purple)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--accent-purple)', marginBottom: '0.75rem' }}>Answer</span>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.9)', margin: 0, flex: 1, display: 'flex', alignItems: 'center' }}>
                      {flashcards[cardIndex].answer}
                    </p>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '1rem', textAlign: 'center' }}>Tap to flip back</span>
                  </div>
                </div>
              </div>

              {/* Know it / Review buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    setKnownIds((prev) => { const s = new Set(prev); s.delete(flashcards[cardIndex].id); return s; });
                    setIsFlipped(false);
                    setCardIndex((i) => (i + 1) % flashcards.length);
                  }}
                  style={{ flex: 1, padding: '0.65rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: 'var(--accent-red)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <ThumbsDown size={14} /> Review Again
                </button>
                <button
                  onClick={() => {
                    setKnownIds((prev) => new Set(prev).add(flashcards[cardIndex].id));
                    setIsFlipped(false);
                    setCardIndex((i) => (i + 1) % flashcards.length);
                  }}
                  style={{ flex: 1, padding: '0.65rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', color: 'var(--accent-green)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <ThumbsUp size={14} /> Know It!
                </button>
              </div>

              {/* Prev / Next nav */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => { setIsFlipped(false); setCardIndex((i) => (i - 1 + flashcards.length) % flashcards.length); }} style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.35rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer' }}>← Prev</button>
                <button onClick={() => { setFlashcards([]); loadFlashcards(); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><RotateCcw size={11} /> New set</button>
                <button onClick={() => { setIsFlipped(false); setCardIndex((i) => (i + 1) % flashcards.length); }} style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.35rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer' }}>Next →</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Learn Tab ── */}
      {activeTab === 'learn' && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Wikipedia card */}
          {articleDescription ? (
            <WikiCard
              topic={topic}
              description={articleDescription}
              image={articleImage}
              url={articleUrl}
            />
          ) : (
            <div
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1rem',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                textAlign: 'center',
              }}
            >
              No Wikipedia summary found for this topic.
            </div>
          )}

          {/* Web search reference cards */}
          {searchResults && searchResults.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '0.65rem',
                }}
              >
                Web References
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {searchResults.map((result) => (
                  <SearchCard key={result.url} result={result} />
                ))}
              </div>
            </div>
          )}

          {/* If nothing at all */}
          {!articleDescription && (!searchResults || searchResults.length === 0) && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              No additional content found. Try asking the AI Tutor directly in the Chat tab!
            </p>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .flip-card { perspective: 1000px; height: 100%; }
        .flip-card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.45s ease; transform-style: preserve-3d; }
        .flip-card-inner.flipped { transform: rotateY(180deg); }
        .flip-card-front, .flip-card-back { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .flip-card-back { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(message.content.replace(/\*\*/g, ''));
    utter.rate = 0.95;
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
    setIsSpeaking(true);
  };

  return (
    <div
      className="animate-fade-in"
      style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '0.5rem' }}
    >
      {!isUser && (
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '2px' }}>
          <Bot size={14} color="white" />
        </div>
      )}

      <div style={{ maxWidth: '82%', display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: '0.3rem' }}>
        {/* Image thumbnail (user messages with attached image) */}
        {message.imageDataUrl && (
          <img
            src={message.imageDataUrl}
            alt="Attached"
            style={{ maxHeight: '140px', maxWidth: '220px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', objectFit: 'cover' }}
          />
        )}

        <div style={{ padding: '0.65rem 0.9rem', borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: isUser ? 'var(--accent-purple)' : 'var(--bg-tertiary)', border: isUser ? 'none' : '1px solid var(--border-color)', fontSize: '0.855rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.92)', wordBreak: 'break-word' }}>
          <MessageContent content={message.content} />
          {message.isStreaming && (
            <span style={{ display: 'inline-block', width: '2px', height: '0.9em', background: 'var(--accent-purple)', marginLeft: '2px', verticalAlign: 'text-bottom', animation: 'blink 0.8s step-end infinite' }} />
          )}
        </div>

        {/* Speaker button on assistant messages */}
        {!isUser && message.content && !message.isStreaming && (
          <button
            onClick={handleSpeak}
            title={isSpeaking ? 'Stop reading' : 'Read aloud'}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.15rem', color: isSpeaking ? 'var(--accent-purple)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', opacity: 0.7 }}
          >
            <Volume2 size={12} />
            {isSpeaking ? 'Stop' : 'Read'}
          </button>
        )}
      </div>
    </div>
  );
}

/** Renders plain text with newline→paragraph support and **bold** highlighting. */
function MessageContent({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <>
      {lines.map((line, i) => {
        // Simple **bold** rendering
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <React.Fragment key={i}>
            {i > 0 && <br />}
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={j}>{part.slice(2, -2)}</strong>
              ) : (
                <React.Fragment key={j}>{part}</React.Fragment>
              )
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}

function PYQCard({ question: q, onAnswer, isCurated }: { question: PYQQuestion; onAnswer?: (correct: boolean) => void; isCurated?: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const answered = selected !== null;

  const handleSelect = (i: number) => {
    if (answered) return;
    setSelected(i);
    onAnswer?.(i === q.correct);
  };

  return (
    <div style={{
      background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
      borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem',
    }}>
      {/* Meta */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        <span style={{
          padding: '0.15rem 0.5rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 700,
          background: isCurated ? 'rgba(59,130,246,0.15)' : 'rgba(139,92,246,0.15)',
          color: isCurated ? 'var(--accent-blue)' : 'var(--accent-purple)',
        }}>{isCurated ? 'Curated' : 'AI'}</span>
        {[q.exam, q.year.toString(), q.subject, q.difficulty].map((tag, i) => (
          <span key={i} style={{
            padding: '0.15rem 0.5rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 600,
            background: i === 3
              ? q.difficulty === 'Easy' ? 'rgba(16,185,129,0.15)' : q.difficulty === 'Medium' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)'
              : 'rgba(255,255,255,0.06)',
            color: i === 3
              ? q.difficulty === 'Easy' ? 'var(--accent-green)' : q.difficulty === 'Medium' ? '#F59E0B' : 'var(--accent-red)'
              : 'var(--text-secondary)',
          }}>{tag}</span>
        ))}
      </div>

      {/* Question */}
      <p style={{ margin: 0, fontSize: '0.84rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.9)' }}>{q.question}</p>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correct;
          const isSelected = selected === i;
          let bg = 'var(--bg-primary)';
          let borderColor = 'var(--border-color)';
          let color = 'rgba(255,255,255,0.8)';
          if (answered) {
            if (isCorrect) { bg = 'rgba(16,185,129,0.15)'; borderColor = 'var(--accent-green)'; color = 'var(--accent-green)'; }
            else if (isSelected) { bg = 'rgba(239,68,68,0.15)'; borderColor = 'var(--accent-red)'; color = 'var(--accent-red)'; }
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              style={{
                padding: '0.5rem 0.75rem', background: bg, border: `1px solid ${borderColor}`,
                borderRadius: '8px', color, fontSize: '0.8rem', textAlign: 'left',
                cursor: answered ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontWeight: 700, opacity: 0.6 }}>{String.fromCharCode(65 + i)}.</span>
              {opt}
              {answered && isCorrect && <CheckCircle2 size={13} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
              {answered && isSelected && !isCorrect && <XCircle size={13} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
            </button>
          );
        })}
      </div>

      {/* Explanation toggle */}
      {answered && (
        <button
          onClick={() => setShowExplanation((v) => !v)}
          style={{
            background: 'transparent', border: 'none', color: 'var(--accent-blue)',
            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: 0,
          }}
        >
          <ChevronDown size={13} style={{ transform: showExplanation ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          {showExplanation ? 'Hide explanation' : 'Show explanation'}
        </button>
      )}
      {showExplanation && (
        <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.8)' }}>
          <strong style={{ color: 'var(--accent-blue)' }}>Explanation: </strong>{q.explanation}
        </div>
      )}
    </div>
  );
}

function WikiCard({
  topic,
  description,
  image,
  url,
}: {
  topic: string;
  description: string;
  image?: string;
  url?: string;
}) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.8rem 1rem 0.6rem',
        }}
      >
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.09em',
          }}
        >
          Wikipedia
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            opacity: 0.5,
          }}
        >
          <div
            style={{
              width: '13px',
              height: '13px',
              background: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: 'black', fontSize: '8px', fontWeight: 'bold' }}>W</span>
          </div>
        </div>
      </div>

      {image && (
        <div
          style={{
            background: 'white',
            margin: '0 1rem 0.75rem',
            borderRadius: '8px',
            padding: '0.4rem',
          }}
        >
          <img
            src={image}
            alt={topic}
            style={{ width: '100%', maxHeight: '130px', objectFit: 'contain', display: 'block' }}
          />
        </div>
      )}

      <div style={{ padding: '0 1rem 1rem' }}>
        <p
          style={{
            fontSize: '0.83rem',
            lineHeight: 1.55,
            color: 'rgba(255,255,255,0.8)',
            margin: '0 0 0.75rem',
            display: '-webkit-box',
            WebkitLineClamp: 7,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {description}
        </p>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--accent-blue)',
              fontSize: '0.75rem',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              opacity: 0.85,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.85')}
          >
            Read more on Wikipedia <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}

function SearchCard({ result }: { result: SearchResult }) {
  return (
    <a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '0.75rem',
        textDecoration: 'none',
        transition: 'border-color 0.15s ease',
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--accent-blue)')
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border-color)')
      }
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.35rem' }}>
        <p
          style={{
            fontSize: '0.82rem',
            fontWeight: 600,
            color: 'var(--accent-blue)',
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {result.title}
        </p>
        <ExternalLink size={12} color="var(--text-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
      </div>
      <p
        style={{
          fontSize: '0.76rem',
          color: 'var(--text-secondary)',
          margin: '0 0 0.25rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.4,
        }}
      >
        {result.description}
      </p>
      <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
        {new URL(result.url).hostname}
      </p>
    </a>
  );
}
