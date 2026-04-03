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

  const systemPrompt = `You are an expert physics/science simulation developer. You create beautiful, interactive educational simulations using p5.js.

Your output must be a COMPLETE, self-contained HTML page that:
- Loads p5.js from CDN: https://cdn.jsdelivr.net/npm/p5@1.11.3/lib/p5.min.js
- Uses dark theme (background: #07111f, text: white/light colors)
- Has interactive controls (sliders, buttons) styled with modern dark UI
- Shows real-time readouts/metrics relevant to the simulation
- Uses accurate physics/math (RK4 or Euler integration where applicable)
- Is responsive (uses windowWidth/windowHeight or percentages)
- Includes a title and brief explanation text
- Uses the Inter font from Google Fonts

Style guidelines:
- Panel backgrounds: rgba(13,28,50,0.96)
- Accent color: #4f8dff (blue), #8d63ff (purple), #20c997 (green)
- Border: rgba(255,255,255,0.1)
- Border radius: 12-16px
- Clean, modern aesthetic similar to a premium dashboard

Return ONLY the complete HTML — no markdown, no explanation, no code fences. Start with <!DOCTYPE html> and end with </html>.`;

  const userPrompt =
    `Create an interactive p5.js simulation for: "${topic}"\n\n` +
    (context ? `Context about this topic:\n${context.slice(0, 800)}\n\n` : '') +
    `The simulation should:\n` +
    `1. Visually demonstrate the core concept with animation\n` +
    `2. Have 2-4 interactive sliders/controls that affect the simulation\n` +
    `3. Show live numerical readouts (measurements, values)\n` +
    `4. Include a brief educational note explaining what the student is seeing\n` +
    `5. Be scientifically/mathematically accurate\n\n` +
    `Return the complete HTML page.`;

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
