// ── Types ─────────────────────────────────────────────────────────────────────

export interface StreakData {
  count: number;
  lastStudyDate: string; // 'YYYY-MM-DD'
  totalDaysStudied: number;
}

export interface StudyPlan {
  generatedAt: string;
  exam: string;
  examDate: string;
  weakSubjects: string[];
  dailyHours: number;
  content: string; // Raw streamed markdown from Groq
}

export interface StudyStore {
  streak: StreakData;
  weaknessMap: Record<string, number>; // topic → questions asked count
  studyPlan: StudyPlan | null;
}

// ── Storage key ───────────────────────────────────────────────────────────────

const KEY = 'ai_mentor_v1';

function today(): string {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

function load(): StudyStore {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as StudyStore;
  } catch { /* ignore parse errors */ }

  return {
    streak: { count: 0, lastStudyDate: '', totalDaysStudied: 0 },
    weaknessMap: {},
    studyPlan: null,
  };
}

function save(store: StudyStore): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch { /* quota exceeded, ignore */ }
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Call whenever a student opens a learning topic. Updates the streak. */
export function recordStudySession(): StreakData {
  const store = load();
  const t = today();
  const { streak } = store;

  if (streak.lastStudyDate === t) {
    // Already studied today — no change
    return streak;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const newCount =
    streak.lastStudyDate === yesterdayStr ? streak.count + 1 : 1;

  store.streak = {
    count: newCount,
    lastStudyDate: t,
    totalDaysStudied: streak.totalDaysStudied + 1,
  };

  save(store);
  return store.streak;
}

/** Increment the number of questions the student has asked about a topic. */
export function recordTopicQuestion(topic: string): void {
  const store = load();
  const key = topic.toLowerCase().trim();
  store.weaknessMap[key] = (store.weaknessMap[key] ?? 0) + 1;
  save(store);
}

/** Get topics sorted by question count (most struggled first). */
export function getWeakTopics(limit = 8): { topic: string; count: number }[] {
  const store = load();
  return Object.entries(store.weaknessMap)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getStreak(): StreakData {
  return load().streak;
}

export function getStudyPlan(): StudyPlan | null {
  return load().studyPlan;
}

export function saveStudyPlan(plan: StudyPlan): void {
  const store = load();
  store.studyPlan = plan;
  save(store);
}
