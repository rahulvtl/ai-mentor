import Groq from 'groq-sdk';

const TUTOR_SYSTEM_PROMPT = `You are an expert AI tutor specialising in Physics, Mathematics, Chemistry, and Biology. Your goal is to help students understand concepts clearly and build genuine intuition.

Guidelines:
- Be concise but thorough — 2-4 short paragraphs max unless the student asks for more detail
- Use concrete examples and analogies to make abstract ideas click
- For maths/physics include key formulas when relevant (plain notation like F = ma)
- Mention real-world applications when they add insight
- Target high school / introductory university level
- For practice questions: give the question first, then offer to reveal the answer
- Be warm and encouraging — build confidence, not dependency

Always tailor your response to the topic the student is currently viewing.`;

const SOCRATIC_SYSTEM_PROMPT = `You are an expert AI tutor specialising in Physics, Mathematics, Chemistry, and Biology. You use the Socratic method exclusively — you NEVER give direct answers. Instead, you guide students to discover answers themselves through targeted questions.

Rules:
- NEVER state the answer directly unless the student has genuinely tried 3+ times
- Ask ONE focused guiding question per response — not multiple
- Acknowledge what the student got right before addressing gaps
- Use hints that progressively reveal more if the student is stuck
- When the student arrives at the correct answer on their own, celebrate it warmly
- Keep questions short, clear, and encouraging
- If the student asks "just tell me", give one more hint then the answer

Example: Student asks "What is the formula for kinetic energy?"
Wrong: "KE = ½mv²"
Right: "Good question! Think about what physical quantities affect how much energy a moving object has. What two properties of the ball differ between a slow rolling marble and a fast-moving truck?"

Always tailor your Socratic questioning to the topic the student is currently viewing.`;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  /** Data URL (image/jpeg or image/png) shown as thumbnail in the chat bubble */
  imageDataUrl?: string;
}

/**
 * Streams a tutor response token-by-token using the Groq API (free tier).
 * Model: llama-3.3-70b-versatile — excellent quality, completely free.
 */
export async function streamTutorResponse(
  conversationHistory: ChatMessage[],
  topic: string,
  studentStateContext: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: Error) => void,
  signal?: AbortSignal,
  socraticMode = false,
  language: 'en' | 'hi' = 'en'
): Promise<void> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    onError(
      new Error(
        'VITE_GROQ_API_KEY is not set. Add your free Groq key to .env — get one at console.groq.com'
      )
    );
    return;
  }

  const client = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  const langInstruction =
    language === 'hi'
      ? '\n\nIMPORTANT: Respond ONLY in Hindi (Devanagari script). Use simple, clear Hindi that a Class 9–12 student would understand. Technical terms (like "formula", "velocity", "photosynthesis") can stay in English but write everything else in Hindi.'
      : '';

  const basePrompt = socraticMode ? SOCRATIC_SYSTEM_PROMPT : TUTOR_SYSTEM_PROMPT;
  const systemPrompt =
    `${basePrompt}${langInstruction}\n\n` +
    `Current topic the student is viewing: "${topic}"\n` +
    (studentStateContext
      ? `Student's current workspace state: ${studentStateContext}`
      : '');

  const apiMessages = conversationHistory.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  try {
    const stream = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...apiMessages,
      ],
    });

    for await (const chunk of stream) {
      if (signal?.aborted) return;
      const text = chunk.choices[0]?.delta?.content ?? '';
      if (text) onChunk(text);
    }

    if (!signal?.aborted) onDone();
  } catch (err) {
    if (signal?.aborted) return;
    onError(err instanceof Error ? err : new Error('Unknown streaming error'));
  }
}

/**
 * Generic streaming function for study planner and test analysis.
 * Sends a single system + user prompt and streams the response.
 */
export async function streamGroqResponse(
  systemPrompt: string,
  userPrompt: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: Error) => void,
  signal?: AbortSignal
): Promise<void> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    onError(new Error('VITE_GROQ_API_KEY is not set.'));
    return;
  }

  const client = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  try {
    const stream = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2048,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    for await (const chunk of stream) {
      if (signal?.aborted) return;
      const text = chunk.choices[0]?.delta?.content ?? '';
      if (text) onChunk(text);
    }

    if (!signal?.aborted) onDone();
  } catch (err) {
    if (signal?.aborted) return;
    onError(err instanceof Error ? err : new Error('Unknown error'));
  }
}

/**
 * Sends an image (as a data URL) + question to a Groq vision model and streams the response.
 * Model: llama-3.2-90b-vision-preview — free, multimodal.
 */
export async function streamVisionResponse(
  imageDataUrl: string,
  question: string,
  topic: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: Error) => void,
  signal?: AbortSignal,
  language: 'en' | 'hi' = 'en'
): Promise<void> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    onError(new Error('VITE_GROQ_API_KEY is not set.'));
    return;
  }

  const client = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  const langInstruction =
    language === 'hi'
      ? ' Respond in Hindi (Devanagari script); technical terms may stay in English.'
      : '';

  const systemPrompt =
    `You are an expert AI tutor specialising in Physics, Mathematics, Chemistry, and Biology. ` +
    `The student has shared an image from their textbook or notes on the topic "${topic}". ` +
    `Analyse the image and help them understand its content. Be concise and educational — ` +
    `identify key concepts, formulas, diagrams, or problems visible in the image.${langInstruction}`;

  try {
    const stream = await client.chat.completions.create({
      model: 'llama-3.2-90b-vision-preview',
      max_tokens: 1024,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageDataUrl } },
            { type: 'text', text: question || 'Explain what you see in this image and how it relates to the topic.' },
          ],
        },
      ],
    } as Parameters<typeof client.chat.completions.create>[0]);

    for await (const chunk of stream as AsyncIterable<{ choices: { delta: { content?: string } }[] }>) {
      if (signal?.aborted) return;
      const text = chunk.choices[0]?.delta?.content ?? '';
      if (text) onChunk(text);
    }

    if (!signal?.aborted) onDone();
  } catch (err) {
    if (signal?.aborted) return;
    onError(err instanceof Error ? err : new Error('Vision model error'));
  }
}

/**
 * Transcribes audio using Groq Whisper via REST (browser-compatible).
 * Returns the transcribed text string.
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY is not set.');

  const formData = new FormData();
  // Use .webm extension; Whisper accepts it
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('model', 'whisper-large-v3');
  formData.append('language', 'en');
  formData.append('response_format', 'json');

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!response.ok) {
    const msg = await response.text().catch(() => response.statusText);
    throw new Error(`Whisper transcription failed: ${msg}`);
  }

  const data = await response.json() as { text?: string };
  return (data.text ?? '').trim();
}

export type ExamType = 'UPSC' | 'SSC' | 'NEET' | 'JEE' | 'Law' | 'General';

const EXAM_STYLE: Record<ExamType, string> = {
  UPSC: 'UPSC Civil Services Prelims style — analytical, often multi-statement (e.g. "Which of the following is/are correct?"), fact-based, covering polity, history, geography, economy, environment, science',
  SSC:  'SSC CGL/CHSL style — straightforward factual MCQs, GK, reasoning, English, basic math, current affairs',
  NEET: 'NEET UG style — biology (botany + zoology), physics, chemistry, diagram-based and conceptual',
  JEE:  'JEE Main/Advanced style — physics, chemistry, mathematics, numerical and conceptual',
  Law:  'Law entrance (CLAT/AILET) style — legal reasoning, constitutional provisions, landmark judgements, legal principles applied to scenarios',
  General: 'General competitive exam style — broad GK, current affairs, logical reasoning, factual MCQs',
};

/**
 * Generates AI-powered PYQ-style MCQs for any topic and exam type.
 */
export async function generateAIPYQs(
  topic: string,
  context: string,
  examType: ExamType
): Promise<Array<{
  question: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  subject: string;
}>> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY is not set.');

  const client = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  const userPrompt =
    `Generate 8 MCQ practice questions on the topic: "${topic}" in the style of: ${EXAM_STYLE[examType]}.\n\n` +
    (context ? `Context about the topic:\n${context.slice(0, 1500)}\n\n` : '') +
    `Requirements:\n` +
    `- Each question has exactly 4 options (A, B, C, D)\n` +
    `- Mix difficulty: 2 Easy, 4 Medium, 2 Hard\n` +
    `- For UPSC: include multi-statement questions ("Consider the following statements...")\n` +
    `- Explanations must be clear and educational (2-3 sentences)\n` +
    `- Questions must be exam-realistic and factually accurate\n\n` +
    `Return ONLY JSON:\n` +
    `{"questions": [{"question":"...","options":["A text","B text","C text","D text"],"correct":0,"explanation":"...","difficulty":"Easy|Medium|Hard","subject":"..."}]}`;

  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 3000,
      stream: false,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are an expert exam question setter for Indian competitive exams. Return only valid JSON.' },
        { role: 'user', content: userPrompt },
      ],
    });

    const parsed = JSON.parse(response.choices[0]?.message?.content ?? '{}') as {
      questions?: Array<{
        question?: string;
        options?: string[];
        correct?: number;
        explanation?: string;
        difficulty?: string;
        subject?: string;
      }>;
    };

    return (parsed.questions ?? [])
      .filter((q) => q.question && Array.isArray(q.options) && q.options.length === 4)
      .map((q) => ({
        question: q.question!,
        options: [q.options![0], q.options![1], q.options![2], q.options![3]] as [string, string, string, string],
        correct: (([0, 1, 2, 3].includes(q.correct ?? -1) ? q.correct : 0) as 0 | 1 | 2 | 3),
        explanation: q.explanation ?? '',
        difficulty: (['Easy', 'Medium', 'Hard'].includes(q.difficulty ?? '') ? q.difficulty : 'Medium') as 'Easy' | 'Medium' | 'Hard',
        subject: q.subject ?? 'General',
      }));
  } catch {
    return [];
  }
}

/**
 * Generates a set of flashcards for a topic using Groq (non-streaming JSON call).
 * Returns an array of {question, answer} objects ready to display.
 */
export async function generateFlashcards(
  topic: string,
  context: string
): Promise<Array<{ question: string; answer: string }>> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY is not set.');

  const client = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  const userPrompt =
    `Create 10 flashcards for exam preparation on the topic: "${topic}".\n\n` +
    (context ? `Context (use this to make cards specific):\n${context.slice(0, 2000)}\n\n` : '') +
    `Rules:\n` +
    `- Questions must be specific, factual, and exam-worthy\n` +
    `- Answers must be concise (1–3 sentences)\n` +
    `- Cover key events, dates, names, causes, effects, definitions\n` +
    `- Vary difficulty: mix easy recall and deeper understanding\n\n` +
    `Return ONLY a JSON object like: {"cards": [{"question": "...", "answer": "..."}, ...]}`;

  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      stream: false,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a flashcard generator. Always return valid JSON only.' },
        { role: 'user', content: userPrompt },
      ],
    });

    const text = response.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const arr = (
      Array.isArray(parsed) ? parsed :
      Array.isArray(parsed.cards) ? parsed.cards :
      Array.isArray(parsed.flashcards) ? parsed.flashcards :
      Array.isArray(parsed.items) ? parsed.items : []
    ) as Array<{ question?: string; answer?: string }>;
    return arr.filter((c) => c.question && c.answer) as Array<{ question: string; answer: string }>;
  } catch {
    return [];
  }
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  category: 'political' | 'military' | 'social' | 'economic' | 'cultural' | 'scientific';
}

export interface MapMarker {
  lat: number;
  lng: number;
  title: string;
  description: string;
}

export interface MapData {
  center: { lat: number; lng: number };
  zoom: number;
  markers: MapMarker[];
}

/**
 * Generates a chronological timeline of key events for a history topic.
 */
export async function generateTimeline(
  topic: string,
  context: string
): Promise<TimelineEvent[]> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY is not set.');

  const client = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  const userPrompt =
    `Generate a chronological timeline of 10–14 key events for the topic: "${topic}".\n\n` +
    (context ? `Context:\n${context.slice(0, 1500)}\n\n` : '') +
    `Rules:\n` +
    `- Order events chronologically\n` +
    `- Each event: a specific year/period, a clear title, a 1–2 sentence description\n` +
    `- Category must be one of: political, military, social, economic, cultural, scientific\n` +
    `- Focus on exam-relevant facts\n\n` +
    `Return ONLY JSON: {"events": [{"year":"...","title":"...","description":"...","category":"..."},...]}`;

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2000,
    stream: false,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'You are a history expert. Return only valid JSON.' },
      { role: 'user', content: userPrompt },
    ],
  });

  try {
    const parsed = JSON.parse(response.choices[0]?.message?.content ?? '{}') as { events?: TimelineEvent[] };
    return (parsed.events ?? []).filter((e) => e.year && e.title);
  } catch {
    return [];
  }
}

/**
 * Generates map markers (locations) relevant to a geography or history topic.
 */
export async function generateMapMarkers(
  topic: string,
  context: string
): Promise<MapData> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY is not set.');

  const client = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  const userPrompt =
    `For the topic "${topic}", generate a set of important geographic locations as map markers.\n\n` +
    (context ? `Context:\n${context.slice(0, 1000)}\n\n` : '') +
    `Return a JSON object with:\n` +
    `- "center": {"lat": number, "lng": number} — the best map center for this topic\n` +
    `- "zoom": number — suggested zoom level (3=world, 5=subcontinent, 7=country, 10=city)\n` +
    `- "markers": array of up to 10 locations, each with lat, lng, title, description (1 sentence)\n\n` +
    `Use accurate real-world coordinates. Return ONLY valid JSON.`;

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1500,
    stream: false,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'You are a geography expert. Return only valid JSON with accurate coordinates.' },
      { role: 'user', content: userPrompt },
    ],
  });

  try {
    const parsed = JSON.parse(response.choices[0]?.message?.content ?? '{}') as Partial<MapData>;
    return {
      center: parsed.center ?? { lat: 20.5937, lng: 78.9629 },
      zoom: parsed.zoom ?? 5,
      markers: (parsed.markers ?? []).filter((m) => m.lat && m.lng && m.title),
    };
  } catch {
    return { center: { lat: 20.5937, lng: 78.9629 }, zoom: 4, markers: [] };
  }
}

/**
 * Generates a self-contained p5.js simulation for a given topic.
 * Returns full HTML that can be rendered inside a sandboxed iframe.
 */
export async function generateSimulation(
  topic: string,
  context: string
): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY is not set.');

  const client = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  const systemPrompt = `You create beautiful, polished p5.js physics simulations. Return ONLY complete HTML. No markdown, no code fences, no explanations.

DESIGN RULES:
1. TWO-COLUMN GRID LAYOUT: Left column (360px) for controls panel. Right column for simulation panel. Both are dark glass cards with rounded corners (20px), border, and backdrop blur. Use CSS grid on a wrapper div (max-width:1280px, centered).
2. LEFT PANEL (controls): Title (large, bold), one-line description, section label "INPUTS", 3-5 labeled sliders with value display, Pause/Reset buttons, and a notes box at the bottom with a tip about the physics.
3. RIGHT PANEL (simulation): A top bar with title + badge ("Fixed solver step: 0.005 s"), a p5 canvas area in the middle, and a bottom readout bar with 3-4 stat cards (label + large bold value) in a grid.
4. CANVAS: Draw a subtle line grid (every 40px, stroke alpha ~20) for texture. Use p5 instance mode with new p5(sketch) — parent the canvas to a div.
5. PHYSICS: Use an RK4 (Runge-Kutta 4th order) fixed-step solver with dt=0.005. Accumulate real frame time, step physics in a while loop. Keep state in a state object.
6. TRAILS: Store 100+ positions, draw as a smooth curve using beginShape()/vertex() with fading alpha.
7. VISUALS: Thick rod (strokeWeight 4), white anchor dot, glowing blue bob (drawingContext.shadowBlur=30), arc showing angle. Label key points on canvas.
8. STATS: Update 3-4 DOM stat cards each frame: angle, angular velocity, period estimate (from zero-crossing detection), and energy.
9. COLORS: Background #07111f, panels rgba(18,38,68,0.96) with border rgba(255,255,255,0.1). Blue accent #4f8dff, purple #8d63ff. Trail: blue with fading alpha. Text: #eef4ff, muted: #a6b5cf.
10. STYLE: Use CSS variables. Buttons with gradient backgrounds and hover transform. Slider with accent-color. Stat cards with subtle borders. Notes box with green-tinted background.
11. RESPONSIVE: At <980px stack to single column. At <620px simplify button grid.

COMPLETE EXAMPLE (pendulum):
<!DOCTYPE html>
<html><head>
<script src="https://cdn.jsdelivr.net/npm/p5@1.11.3/lib/p5.min.js"></script>
<style>
:root{--bg:#07111f;--panel:rgba(18,38,68,0.96);--border:rgba(255,255,255,0.1);--text:#eef4ff;--muted:#a6b5cf;--blue:#4f8dff;--radius:20px}
*{box-sizing:border-box;margin:0}
body{background:radial-gradient(circle at top left,#0c2144,#07111f 45%,#040a14);color:var(--text);font-family:system-ui,sans-serif;min-height:100vh}
.app{max-width:1280px;margin:0 auto;padding:24px;display:grid;grid-template-columns:360px 1fr;gap:20px}
.card{background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);backdrop-filter:blur(10px)}
.controls{padding:22px;align-self:start;position:sticky;top:20px}
.controls h1{font-size:2.2rem;letter-spacing:-0.04em;margin-bottom:8px}
.controls .desc{color:var(--muted);font-size:0.95rem;margin-bottom:18px}
.sec{font-size:0.78rem;text-transform:uppercase;letter-spacing:0.14em;color:#c8d7f4;margin:18px 0 10px}
.field{margin-bottom:12px}
.field .row{display:flex;justify-content:space-between;font-size:0.92rem;margin-bottom:4px}
.field .row span:last-child{color:#d8e4ff;font-variant-numeric:tabular-nums}
input[type=range]{width:100%;accent-color:var(--blue);cursor:pointer}
.btns{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
.btns button{border:0;border-radius:14px;padding:12px;font:inherit;font-weight:700;color:#fff;cursor:pointer;transition:transform .15s}
.btns button:hover{transform:translateY(-1px)}
.btn-blue{background:linear-gradient(180deg,#5c97ff,#3f77e0)}
.btn-purple{background:linear-gradient(180deg,#7f66ff,#6448dc)}
.notes{margin-top:18px;padding:14px;border-radius:16px;background:rgba(32,201,151,0.08);border:1px solid rgba(32,201,151,0.16);color:#d7fff4;font-size:0.88rem;line-height:1.5}
.sim{display:grid;grid-template-rows:auto 1fr auto;min-height:700px;overflow:hidden}
.topbar{padding:16px 22px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
.topbar h2{font-size:1.1rem;font-weight:800}
.topbar .sub{color:var(--muted);font-size:0.85rem;margin-top:4px}
.badge{padding:8px 12px;border-radius:999px;background:rgba(79,141,255,0.14);color:#cfe0ff;font-size:0.85rem}
.canvas-wrap{position:relative;min-height:500px}
#sim-canvas{width:100%;height:100%;min-height:500px}
.readout{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:18px 22px;border-top:1px solid var(--border)}
.rcard{padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06)}
.rcard .lab{color:var(--muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px}
.rcard .val{font-size:1.35rem;font-weight:800;font-variant-numeric:tabular-nums}
@media(max-width:980px){.app{grid-template-columns:1fr}.controls{position:static}.readout{grid-template-columns:1fr 1fr}}
</style></head><body>
<main class="app">
<section class="card controls">
<h1>Pendulum Sim</h1>
<p class="desc">RK4-integrated pendulum with damping and trail visualization.</p>
<div class="sec">Inputs</div>
<div class="field"><div class="row"><span>Initial angle</span><span id="av">35°</span></div><input id="ang" type="range" min="-85" max="85" value="35"></div>
<div class="field"><div class="row"><span>Length</span><span id="lv">1.40 m</span></div><input id="len" type="range" min="0.5" max="3" value="1.4" step="0.01"></div>
<div class="field"><div class="row"><span>Gravity</span><span id="gv">9.81 m/s²</span></div><input id="grav" type="range" min="1.6" max="24" value="9.81" step="0.01"></div>
<div class="field"><div class="row"><span>Damping</span><span id="dv">0.020</span></div><input id="damp" type="range" min="0" max="0.2" value="0.02" step="0.001"></div>
<div class="btns"><button class="btn-blue" id="togBtn">Pause</button><button class="btn-purple" id="rstBtn">Reset</button></div>
<div class="notes">Uses a fixed-step RK4 solver (dt=0.005s) decoupled from frame rate for accurate, deterministic physics.</div>
</section>
<section class="card sim">
<div class="topbar"><div><h2>Live simulation</h2><div class="sub">Adjust parameters — solver updates instantly.</div></div><div class="badge">Solver dt: 0.005 s</div></div>
<div class="canvas-wrap"><div id="sim-canvas"></div></div>
<div class="readout">
<div class="rcard"><div class="lab">Angle</div><div class="val" id="o1">0°</div></div>
<div class="rcard"><div class="lab">Ang. velocity</div><div class="val" id="o2">0 rad/s</div></div>
<div class="rcard"><div class="lab">Period</div><div class="val" id="o3">— s</div></div>
<div class="rcard"><div class="lab">Energy</div><div class="val" id="o4">0.000</div></div>
</div>
</section>
</main>
<script>
const C={ang:'ang',len:'len',grav:'grav',damp:'damp'};
const S={theta:35*Math.PI/180,omega:0,t:0,running:true,trail:[],acc:0,lastCross:null,period:0};
const DT=0.005;
function g(id){return document.getElementById(id)}
function params(){return{L:+g('len').value,G:+g('grav').value,D:+g('damp').value}}
function deriv(th,om,p){return{dTh:om,dOm:-(p.G/p.L)*Math.sin(th)-p.D*om}}
function rk4(th,om,dt,p){
  const k1=deriv(th,om,p),k2=deriv(th+.5*dt*k1.dTh,om+.5*dt*k1.dOm,p);
  const k3=deriv(th+.5*dt*k2.dTh,om+.5*dt*k2.dOm,p),k4=deriv(th+dt*k3.dTh,om+dt*k3.dOm,p);
  return{theta:th+dt*(k1.dTh+2*k2.dTh+2*k3.dTh+k4.dTh)/6,omega:om+dt*(k1.dOm+2*k2.dOm+2*k3.dOm+k4.dOm)/6}
}
function reset(){S.theta=+g('ang').value*Math.PI/180;S.omega=0;S.t=0;S.trail=[];S.acc=0;S.lastCross=null;S.period=0}
['ang','len','grav','damp'].forEach(id=>{g(id).oninput=()=>{
  g('av').textContent=g('ang').value+'°';g('lv').textContent=(+g('len').value).toFixed(2)+' m';
  g('gv').textContent=(+g('grav').value).toFixed(2)+' m/s²';g('dv').textContent=(+g('damp').value).toFixed(3);
  if(id==='ang')reset();
}});
g('togBtn').onclick=e=>{S.running=!S.running;e.target.textContent=S.running?'Pause':'Resume'};
g('rstBtn').onclick=reset;
const sketch=p=>{let host;
  p.setup=()=>{host=g('sim-canvas');p.createCanvas(host.clientWidth,560).parent(host)};
  p.windowResized=()=>{if(host)p.resizeCanvas(host.clientWidth,560)};
  p.draw=()=>{
    p.background(8,17,31);
    p.stroke(255,255,255,20);p.strokeWeight(1);
    for(let x=0;x<p.width;x+=40)p.line(x,0,x,p.height);
    for(let y=0;y<p.height;y+=40)p.line(0,y,p.width,y);
    if(S.running){const pr=params();S.acc+=Math.min(p.deltaTime/1000,0.033);
      while(S.acc>=DT){const prev=S.theta;const n=rk4(S.theta,S.omega,DT,pr);S.theta=n.theta;S.omega=n.omega;S.t+=DT;S.acc-=DT;
        if(prev<0&&S.theta>=0&&S.omega>0){if(S.lastCross!==null)S.period=S.t-S.lastCross;S.lastCross=S.t;}}}
    const pr=params(),ax=p.width/2,ay=90,ppm=Math.min(220,p.height*0.3/pr.L+70),rl=pr.L*ppm;
    const bx=ax+rl*Math.sin(S.theta),by=ay+rl*Math.cos(S.theta);
    S.trail.push({x:bx,y:by});if(S.trail.length>140)S.trail.shift();
    p.noFill();p.beginShape();
    for(let i=0;i<S.trail.length;i++){p.stroke(79,141,255,p.map(i,0,S.trail.length-1,20,140));p.strokeWeight(2);p.vertex(S.trail[i].x,S.trail[i].y)}
    p.endShape();
    p.stroke(226,236,255);p.strokeWeight(4);p.line(ax,ay,bx,by);
    p.noStroke();p.fill(255);p.circle(ax,ay,12);
    p.drawingContext.shadowBlur=30;p.drawingContext.shadowColor='rgba(79,141,255,0.45)';
    p.fill(79,141,255);p.circle(bx,by,34);p.drawingContext.shadowBlur=0;
    p.noFill();p.stroke(141,99,255,100);p.strokeWeight(2);p.arc(ax,ay,rl*0.7,rl*0.7,-Math.PI/2,S.theta-Math.PI/2);
    p.noStroke();p.fill(220,232,255);p.textSize(14);
    p.text('anchor',ax+10,ay-10);p.text('length: '+pr.L.toFixed(2)+' m',24,34);p.text('gravity: '+pr.G.toFixed(2)+' m/s²',24,56);
    g('o1').textContent=(S.theta*180/Math.PI).toFixed(1)+'°';
    g('o2').textContent=S.omega.toFixed(2)+' rad/s';
    g('o3').textContent=S.period?S.period.toFixed(2)+' s':'— s';
    const E=pr.G*pr.L*(1-Math.cos(S.theta))+0.5*Math.pow(pr.L*S.omega,2);
    g('o4').textContent=E.toFixed(3);
  };
};new p5(sketch);
</script></body></html>

Adapt this EXACT design to any requested topic. Keep the two-column grid layout, glass panels, grid-line background, glow effects, smooth trail curve, stat readout cards, Pause/Reset buttons, and notes box. Change the physics (always use RK4 solver), shapes, sliders, and stats to match the topic.`;

  const userPrompt =
    `Create a polished p5.js simulation: "${topic}". ` +
    (context ? `(${context.slice(0, 200)}) ` : '') +
    `Use the EXACT same two-column layout, glass-card styling, grid background, RK4 solver, trail curves, glow effects, stat readout cards, and Pause/Reset buttons from the example. Adapt physics, sliders, shapes, and stats to this topic. Return complete HTML only.`;

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 6000,
    stream: false,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  let html = response.choices[0]?.message?.content ?? '';

  // Strip markdown code fences if the model wrapped the output
  html = html.replace(/^```html?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

  if (!html.startsWith('<!DOCTYPE') && !html.startsWith('<html')) {
    throw new Error('Invalid simulation output — expected HTML.');
  }

  return html;
}

/** Formats student workspace state into a readable sentence for the system prompt. */
export function buildStudentStateContext(state: Record<string, unknown>): string {
  if (!state || Object.keys(state).length === 0) return '';
  const parts: string[] = [];
  if (typeof state.angle === 'number') parts.push(`angle = ${state.angle.toFixed(1)}°`);
  if (typeof state.magnitude === 'number') parts.push(`magnitude = ${state.magnitude.toFixed(2)}`);
  if (typeof state.area === 'number') parts.push(`area = ${state.area.toFixed(1)}`);
  if (typeof state.length === 'number') parts.push(`length = ${state.length.toFixed(1)}`);
  if (typeof state.width === 'number') parts.push(`width = ${state.width.toFixed(1)}`);
  if (state.valA !== undefined) parts.push(`side a = ${state.valA}`);
  if (state.valB !== undefined) parts.push(`side b = ${state.valB}`);
  if (state.valC !== undefined) parts.push(`side c = ${state.valC}`);
  return parts.join(', ');
}
