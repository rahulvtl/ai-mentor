// ── Types ─────────────────────────────────────────────────────────────────────

export interface StreakData {
  count: number;
  lastStudyDate: string; // 'YYYY-MM-DD'
  totalDaysStudied: number;
}

export interface StudyPlan {
  id: string;
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
  studyPlans: StudyPlan[];
}

// ── Storage key ───────────────────────────────────────────────────────────────

const KEY = 'ai_mentor_v1';
const LEGACY_CHECKS_KEY = 'ai-mentor-plan-checks';

function today(): string {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

function load(): StudyStore {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      let migrated = false;

      // Back-compat: legacy single-plan shape { studyPlan: StudyPlan | null }
      const legacyPlan = parsed.studyPlan as Partial<StudyPlan> | null | undefined;
      if (legacyPlan && !Array.isArray(parsed.studyPlans)) {
        const id = (legacyPlan as { id?: string }).id ?? `plan-${Date.now()}`;
        parsed.studyPlans = [{ ...(legacyPlan as StudyPlan), id }];
        delete parsed.studyPlan;
        // Move global progress checks under the migrated plan's id
        try {
          const oldChecks = localStorage.getItem(LEGACY_CHECKS_KEY);
          if (oldChecks) {
            localStorage.setItem(`${LEGACY_CHECKS_KEY}-${id}`, oldChecks);
            localStorage.removeItem(LEGACY_CHECKS_KEY);
          }
        } catch { /* ignore */ }
        migrated = true;
      }
      if (!Array.isArray(parsed.studyPlans)) parsed.studyPlans = [];

      const out: StudyStore = {
        streak: (parsed.streak as StreakData) ?? { count: 0, lastStudyDate: '', totalDaysStudied: 0 },
        weaknessMap: (parsed.weaknessMap as Record<string, number>) ?? {},
        studyPlans: parsed.studyPlans as StudyPlan[],
      };

      if (migrated) {
        try { localStorage.setItem(KEY, JSON.stringify(out)); } catch { /* ignore */ }
      }
      return out;
    }
  } catch { /* ignore parse errors */ }

  return {
    streak: { count: 0, lastStudyDate: '', totalDaysStudied: 0 },
    weaknessMap: {},
    studyPlans: [],
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

export function getStudyPlans(): StudyPlan[] {
  return load().studyPlans;
}

export function getStudyPlan(id: string): StudyPlan | null {
  return load().studyPlans.find((p) => p.id === id) ?? null;
}

/** Upsert: if the plan id already exists, update in place; otherwise prepend. */
export function saveStudyPlan(plan: StudyPlan): void {
  const store = load();
  const idx = store.studyPlans.findIndex((p) => p.id === plan.id);
  if (idx >= 0) store.studyPlans[idx] = plan;
  else store.studyPlans.unshift(plan);
  save(store);
}

export function deleteStudyPlan(id: string): void {
  const store = load();
  store.studyPlans = store.studyPlans.filter((p) => p.id !== id);
  save(store);
  // Clean up that plan's progress checks
  try { localStorage.removeItem(`${LEGACY_CHECKS_KEY}-${id}`); } catch { /* ignore */ }
}

export function newPlanId(): string {
  return `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
