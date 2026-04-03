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
1. TWO-PANEL LAYOUT: Left panel (fixed, 280px) for controls. Right area for the p5.js canvas.
2. LEFT PANEL: Dark glass card with title, description (1 line), labeled sliders (2-4), Pause/Reset buttons, and a stats section at the bottom showing 2-3 live values.
3. CANVAS AREA: Use a p5 canvas that fills the right side. Draw a subtle dot grid or fine grid pattern on the background for texture. Center the simulation in the canvas.
4. ANIMATION: Global state vars, update physics every frame in draw(), draw shapes with glow effects and motion trails.
5. TRAILS: Store last 40+ positions in an array, draw them as fading circles/lines for smooth motion trails.
6. COLORS: Use a blue-cyan-white palette. Glowing effects with shadow blur. The bob/object should have a radial gradient glow.
7. STATS: Show 2-3 real-time computed values (angle, velocity, energy, etc.) in styled cards at the bottom of the left panel.
8. Use accurate physics formulas.

COMPLETE EXAMPLE:
<!DOCTYPE html>
<html><head>
<script src="https://cdn.jsdelivr.net/npm/p5@1.11.3/lib/p5.min.js"></script>
<style>
*{margin:0;box-sizing:border-box}
body{background:#0a1628;color:#e0e8f0;font-family:'Segoe UI',system-ui,sans-serif;overflow:hidden;display:flex;height:100vh}
.panel{width:280px;min-width:280px;background:linear-gradient(180deg,rgba(15,25,50,0.98),rgba(10,18,35,0.98));border-right:1px solid rgba(100,160,255,0.1);padding:20px;display:flex;flex-direction:column;gap:16px;overflow-y:auto}
.panel h2{font-size:1.25rem;font-weight:700;color:#fff;margin:0}
.panel .desc{font-size:0.78rem;color:#7a8ba8;line-height:1.4;margin:0}
.section-label{font-size:0.65rem;text-transform:uppercase;letter-spacing:1.5px;color:#4a6a8a;font-weight:600;margin-top:4px}
.slider-group{display:flex;flex-direction:column;gap:2px}
.slider-row{display:flex;justify-content:space-between;align-items:center;font-size:0.82rem;color:#a0b4cc}
.slider-row .val{color:#5b9fff;font-weight:700;font-size:0.85rem}
input[type=range]{-webkit-appearance:none;width:100%;height:5px;border-radius:4px;background:rgba(80,140,255,0.15);outline:none;margin-top:2px}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#5b9fff;cursor:pointer;box-shadow:0 0 8px rgba(91,159,255,0.5)}
.btn-row{display:flex;gap:8px}
.btn{flex:1;padding:8px 0;border:none;border-radius:8px;font-family:inherit;font-size:0.8rem;font-weight:600;cursor:pointer;transition:background 0.2s}
.btn-pause{background:rgba(91,159,255,0.15);color:#5b9fff;border:1px solid rgba(91,159,255,0.3)}
.btn-reset{background:rgba(255,100,100,0.12);color:#ff7b7b;border:1px solid rgba(255,100,100,0.25)}
.stats{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:auto}
.stat{background:rgba(91,159,255,0.06);border:1px solid rgba(91,159,255,0.1);border-radius:8px;padding:8px 10px;text-align:center}
.stat .label{font-size:0.6rem;text-transform:uppercase;letter-spacing:1px;color:#5a7a9a}
.stat .value{font-size:1.05rem;font-weight:700;color:#fff;margin-top:2px}
#canvas-container{flex:1;position:relative}
</style></head><body>
<div class="panel">
<h2>Pendulum</h2>
<p class="desc">Simple pendulum with damping and trail</p>
<div class="section-label">Parameters</div>
<div class="slider-group">
<div class="slider-row"><span>Length</span><span class="val" id="lv">200 px</span></div>
<input type="range" id="len" min="80" max="350" value="200" oninput="document.getElementById('lv').textContent=this.value+' px'">
</div>
<div class="slider-group">
<div class="slider-row"><span>Gravity</span><span class="val" id="gv">9.8 m/s²</span></div>
<input type="range" id="grav" min="1" max="30" value="10" oninput="document.getElementById('gv').textContent=(this.value*9.8/10).toFixed(1)+' m/s²'">
</div>
<div class="slider-group">
<div class="slider-row"><span>Damping</span><span class="val" id="dv">0.995</span></div>
<input type="range" id="damp" min="980" max="1000" value="995" oninput="document.getElementById('dv').textContent=(this.value/1000).toFixed(3)">
</div>
<div class="btn-row">
<button class="btn btn-pause" id="pauseBtn" onclick="paused=!paused;this.textContent=paused?'Play':'Pause'">Pause</button>
<button class="btn btn-reset" onclick="angle=PI/4;aVel=0;trail=[]">Reset</button>
</div>
<div class="section-label">Live Stats</div>
<div class="stats">
<div class="stat"><div class="label">Angle</div><div class="value" id="s1">35.0°</div></div>
<div class="stat"><div class="label">Velocity</div><div class="value" id="s2">0.00</div></div>
<div class="stat"><div class="label">Period</div><div class="value" id="s3">2.84 s</div></div>
<div class="stat"><div class="label">Energy</div><div class="value" id="s4">1.00</div></div>
</div>
</div>
<div id="canvas-container"></div>
<script>
let angle=PI/4,aVel=0,paused=false,trail=[];
function setup(){let c=createCanvas(windowWidth-280,windowHeight);c.parent('canvas-container')}
function windowResized(){resizeCanvas(windowWidth-280,windowHeight)}
function draw(){
  background(10,22,40);
  // dot grid
  stroke(255,8);strokeWeight(1);
  for(let x=0;x<width;x+=30)for(let y=0;y<height;y+=30)point(x,y);
  let L=+document.getElementById('len').value;
  let g=document.getElementById('grav').value*9.8/10;
  let d=document.getElementById('damp').value/1000;
  if(!paused){let aAcc=-g/L*sin(angle);aVel+=aAcc;aVel*=d;angle+=aVel;}
  let ox=width/2,oy=height*0.15;
  let bx=ox+L*sin(angle),by=oy+L*cos(angle);
  trail.push({x:bx,y:by});if(trail.length>50)trail.shift();
  // trail
  noStroke();
  for(let i=0;i<trail.length;i++){let a=map(i,0,trail.length,0,180);fill(91,159,255,a*0.4);circle(trail[i].x,trail[i].y,map(i,0,trail.length,3,10));}
  // rod
  stroke(180,210,240,120);strokeWeight(2);line(ox,oy,bx,by);
  // anchor
  fill(200);noStroke();circle(ox,oy,10);
  // bob glow
  drawingContext.shadowBlur=25;drawingContext.shadowColor='rgba(91,159,255,0.6)';
  fill(91,159,255);circle(bx,by,28);
  drawingContext.shadowBlur=0;
  fill(140,190,255);circle(bx,by,14);
  // stats
  document.getElementById('s1').textContent=(degrees(angle)%360).toFixed(1)+'°';
  document.getElementById('s2').textContent=aVel.toFixed(3)+' rad/s';
  document.getElementById('s3').textContent=(2*PI*sqrt(L/g)/60).toFixed(2)+' s';
  document.getElementById('s4').textContent=(0.5*aVel*aVel*L*L+g*L*(1-cos(angle))).toFixed(2);
}
</script></body></html>

Adapt this pattern to any topic. Keep the two-panel layout, glass-card styling, dot-grid background, glow effects, motion trails, and live stats. Change the physics, shapes, and parameters to match the requested simulation.`;

  const userPrompt =
    `Create animated p5.js simulation: "${topic}". ` +
    (context ? `(${context.slice(0, 200)}) ` : '') +
    `Include global state variables, update physics each frame in draw(), and render moving shapes/particles on the full canvas. Add 2-3 control sliders. Return complete HTML only.`;

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 8000,
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
