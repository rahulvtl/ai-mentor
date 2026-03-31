import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight, Clock, AlertTriangle, Lightbulb, Trophy, BookOpen } from 'lucide-react';

const SUBJECT_COLORS: Record<string, string> = {
  physics: '#3B82F6',
  chemistry: '#10B981',
  mathematics: '#8B5CF6',
  maths: '#8B5CF6',
  math: '#8B5CF6',
  biology: '#F59E0B',
  revision: '#6B7280',
  mock: '#EF4444',
  analysis: '#EF4444',
  review: '#6B7280',
};

function getSubjectColor(subject: string): string {
  const lower = subject.toLowerCase();
  for (const [key, color] of Object.entries(SUBJECT_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return '#6B7280';
}

interface DaySchedule {
  day: string;
  sessions: { subject: string; hours: string; topics: string }[];
}

interface ParsedPlan {
  strategy: string;
  days: DaySchedule[];
  tips: string[];
  warnings: string[];
}

function parsePlanText(text: string): ParsedPlan {
  const lines = text.split('\n');
  const result: ParsedPlan = { strategy: '', days: [], tips: [], warnings: [] };

  let section = '';
  let currentDay: DaySchedule | null = null;
  const strategyLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect sections
    const lower = trimmed.toLowerCase();
    if (lower.includes('strategy overview') || lower.includes('strategy:')) {
      section = 'strategy';
      continue;
    }
    if (lower.includes('day-by-day') || lower.includes('weekly schedule') || lower.includes('day | subject')) {
      section = 'schedule';
      continue;
    }
    if (lower.includes('revision tip') || lower.includes('daily revision') || lower.includes('study tips')) {
      section = 'tips';
      continue;
    }
    if (lower.includes('warning') || lower.includes('what not to do') || lower.includes('what not')) {
      section = 'warnings';
      continue;
    }
    if (lower.includes('priority order') || lower.includes('subject-wise priority')) {
      section = 'priority';
      continue;
    }
    if (lower.includes('motivational')) {
      section = 'motivation';
      continue;
    }

    // Skip table headers and separators
    if (trimmed.startsWith('|') && (trimmed.includes('---') || lower.includes('day') && lower.includes('subject') && lower.includes('time'))) continue;

    // Parse table rows (schedule)
    if (section === 'schedule' && trimmed.startsWith('|')) {
      const cells = trimmed.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length >= 3) {
        const dayName = cells[0];
        const subject = cells[1];
        const hours = cells[2];
        const topics = cells[3] || '';

        if (dayName && dayName !== '') {
          if (currentDay && currentDay.day !== dayName) {
            result.days.push(currentDay);
            currentDay = { day: dayName, sessions: [] };
          } else if (!currentDay) {
            currentDay = { day: dayName, sessions: [] };
          }
        }
        if (currentDay && subject) {
          currentDay.sessions.push({ subject, hours, topics });
        }
      }
      continue;
    }

    // Detect day headers like "**Monday:**" or "### Monday"
    if (section === 'schedule' || section === '') {
      const dayMatch = trimmed.match(/^(?:\*\*|#{1,3}\s*)?(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[\s:*]*/i);
      if (dayMatch) {
        if (currentDay) result.days.push(currentDay);
        currentDay = { day: dayMatch[1], sessions: [] };
        section = 'schedule';

        // Check if there's content after the day name on the same line
        const afterDay = trimmed.replace(/^(?:\*\*|#{1,3}\s*)?(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[\s:*]*/i, '').trim();
        if (afterDay) {
          // Try to parse "Subject - Hours - Topics" format
          const parts = afterDay.split(/[-–|]/).map(p => p.trim()).filter(Boolean);
          if (parts.length >= 2) {
            currentDay.sessions.push({ subject: parts[0], hours: parts[1], topics: parts.slice(2).join(', ') });
          }
        }
        continue;
      }
    }

    // Parse bullet items under a day
    if (section === 'schedule' && currentDay && (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*'))) {
      const content = trimmed.replace(/^[-•*]\s*/, '').replace(/\*\*/g, '');
      const parts = content.split(/[-–:]/).map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const hourMatch = content.match(/(\d+\.?\d*)\s*(?:hour|hr|h)/i);
        currentDay.sessions.push({
          subject: parts[0],
          hours: hourMatch ? hourMatch[1] + 'h' : parts[1],
          topics: parts.slice(2).join(', ') || (hourMatch ? parts[1] : ''),
        });
      }
      continue;
    }

    // Parse tips
    if (section === 'tips') {
      const cleaned = trimmed.replace(/^\d+\.\s*/, '').replace(/^[-•*]\s*/, '').replace(/\*\*/g, '');
      if (cleaned.length > 5) result.tips.push(cleaned);
      continue;
    }

    // Parse warnings
    if (section === 'warnings') {
      const cleaned = trimmed.replace(/^\d+\.\s*/, '').replace(/^[-•*]\s*/, '').replace(/\*\*/g, '');
      if (cleaned.length > 5) result.warnings.push(cleaned);
      continue;
    }

    // Strategy text
    if (section === 'strategy') {
      const cleaned = trimmed.replace(/\*\*/g, '');
      if (cleaned.length > 5 && !cleaned.startsWith('#')) strategyLines.push(cleaned);
    }
  }

  if (currentDay) result.days.push(currentDay);
  result.strategy = strategyLines.join(' ').slice(0, 300);

  return result;
}

interface Props {
  planText: string;
  daysLeft: number | null;
  exam: string;
  onLearnTopic?: (topic: string) => void;
}

const STORAGE_KEY = 'ai-mentor-plan-checks';

function loadChecks(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return new Set(JSON.parse(stored));
  } catch { /* ignore */ }
  return new Set();
}

function saveChecks(checks: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...checks]));
}

export const PlanRenderer: React.FC<Props> = ({ planText, daysLeft, exam, onLearnTopic }) => {
  const plan = parsePlanText(planText);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0]));
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => loadChecks());

  // Persist checks to localStorage
  useEffect(() => {
    saveChecks(checkedItems);
  }, [checkedItems]);

  const toggleDay = (i: number) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const toggleCheck = useCallback((key: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  const handleLearn = useCallback((topic: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onLearnTopic?.(topic);
  }, [onLearnTopic]);

  const totalSessions = plan.days.reduce((sum, d) => sum + d.sessions.length, 0);
  const completedSessions = checkedItems.size;
  const progress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  // If parsing didn't find any days, fall back to raw text
  if (plan.days.length === 0) {
    return (
      <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.84rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.85)' }}>
        {planText}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Countdown + Progress Header */}
      <div style={{
        display: 'flex', gap: '1rem', alignItems: 'center',
        padding: '1rem', borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
        border: '1px solid rgba(59,130,246,0.2)',
      }}>
        {/* Countdown Ring */}
        {daysLeft !== null && (
          <div style={{ position: 'relative', width: '70px', height: '70px', flexShrink: 0 }}>
            <svg width="70" height="70" viewBox="0 0 70 70">
              <circle cx="35" cy="35" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
              <circle
                cx="35" cy="35" r="30" fill="none"
                stroke={daysLeft < 60 ? '#EF4444' : daysLeft < 120 ? '#F59E0B' : '#10B981'}
                strokeWidth="5"
                strokeDasharray={`${Math.min(100, (1 - daysLeft / 365) * 100) * 1.885} 188.5`}
                strokeLinecap="round"
                transform="rotate(-90 35 35)"
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{daysLeft}</span>
              <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', marginTop: '-2px' }}>days</span>
            </div>
          </div>
        )}
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>{exam} Study Plan</h3>
          {plan.strategy && (
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {plan.strategy.slice(0, 150)}{plan.strategy.length > 150 ? '…' : ''}
            </p>
          )}
          {/* Progress bar */}
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-green)', borderRadius: '2px', transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              {completedSessions}/{totalSessions} done
            </span>
          </div>
        </div>
      </div>

      {/* Day Cards */}
      {plan.days.map((day, i) => {
        const isExpanded = expandedDays.has(i);
        const dayCompleted = day.sessions.every((_, j) => checkedItems.has(`${i}-${j}`));
        return (
          <div key={i} style={{
            borderRadius: '12px',
            border: `1px solid ${dayCompleted ? 'rgba(16,185,129,0.3)' : 'var(--border-color)'}`,
            background: dayCompleted ? 'rgba(16,185,129,0.04)' : 'var(--bg-tertiary)',
            overflow: 'hidden',
            transition: 'all 0.2s',
          }}>
            {/* Day Header */}
            <button
              onClick={() => toggleDay(i)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.85rem 1rem', background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left',
              }}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span style={{ fontWeight: 700, fontSize: '0.9rem', flex: 1 }}>
                {dayCompleted && <span style={{ color: 'var(--accent-green)', marginRight: '0.3rem' }}>✓</span>}
                {day.day}
              </span>
              {/* Subject color dots */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {day.sessions.map((s, j) => (
                  <div key={j} style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: getSubjectColor(s.subject),
                  }} />
                ))}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {day.sessions.length} sessions
              </span>
            </button>

            {/* Sessions */}
            {isExpanded && (
              <div style={{ padding: '0 1rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {day.sessions.map((session, j) => {
                  const key = `${i}-${j}`;
                  const checked = checkedItems.has(key);
                  const color = getSubjectColor(session.subject);
                  return (
                    <div
                      key={j}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.7rem 0.85rem', borderRadius: '10px',
                        background: checked ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${checked ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)'}`,
                        transition: 'all 0.15s',
                        opacity: checked ? 0.6 : 1,
                      }}
                    >
                      {/* Checkbox */}
                      <div
                        onClick={(e) => toggleCheck(key, e)}
                        style={{
                          width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
                          border: `2px solid ${checked ? 'var(--accent-green)' : 'rgba(255,255,255,0.15)'}`,
                          background: checked ? 'var(--accent-green)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}>
                        {checked && <span style={{ color: 'white', fontSize: '0.65rem', fontWeight: 700 }}>✓</span>}
                      </div>

                      {/* Subject tag */}
                      <div style={{
                        padding: '0.15rem 0.6rem', borderRadius: '6px',
                        background: `${color}18`, border: `1px solid ${color}33`,
                        color, fontSize: '0.72rem', fontWeight: 700,
                        whiteSpace: 'nowrap', flexShrink: 0,
                      }}>
                        {session.subject}
                      </div>

                      {/* Topics */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          margin: 0, fontSize: '0.8rem', color: 'var(--text-primary)',
                          textDecoration: checked ? 'line-through' : 'none',
                        }}>
                          {session.topics || session.subject}
                        </p>
                      </div>

                      {/* Time badge */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                        fontSize: '0.7rem', color: 'var(--text-secondary)',
                        whiteSpace: 'nowrap', flexShrink: 0,
                      }}>
                        <Clock size={11} />
                        {session.hours}
                      </div>

                      {/* Learn button */}
                      {onLearnTopic && !checked && (
                        <button
                          onClick={(e) => handleLearn(session.topics || session.subject, e)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.3rem 0.65rem', borderRadius: '8px',
                            background: `${color}15`, border: `1px solid ${color}33`,
                            color, fontSize: '0.7rem', fontWeight: 600,
                            cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = `${color}30`; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = `${color}15`; }}
                        >
                          <BookOpen size={12} />
                          Learn
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Tips & Warnings */}
      {(plan.tips.length > 0 || plan.warnings.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: plan.tips.length > 0 && plan.warnings.length > 0 ? '1fr 1fr' : '1fr', gap: '0.75rem' }}>
          {plan.tips.length > 0 && (
            <div style={{
              padding: '1rem', borderRadius: '12px',
              background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                <Lightbulb size={14} color="var(--accent-blue)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tips</span>
              </div>
              {plan.tips.slice(0, 5).map((tip, i) => (
                <p key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.35rem 0', lineHeight: 1.4 }}>
                  • {tip.length > 100 ? tip.slice(0, 100) + '…' : tip}
                </p>
              ))}
            </div>
          )}
          {plan.warnings.length > 0 && (
            <div style={{
              padding: '1rem', borderRadius: '12px',
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                <AlertTriangle size={14} color="var(--accent-red)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avoid</span>
              </div>
              {plan.warnings.slice(0, 5).map((w, i) => (
                <p key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.35rem 0', lineHeight: 1.4 }}>
                  • {w.length > 100 ? w.slice(0, 100) + '…' : w}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Completion celebration */}
      {progress === 100 && (
        <div style={{
          padding: '1rem', borderRadius: '12px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.1))',
          border: '1px solid rgba(16,185,129,0.3)',
        }}>
          <Trophy size={24} color="var(--accent-green)" style={{ marginBottom: '0.4rem' }} />
          <p style={{ margin: 0, fontWeight: 700, color: 'var(--accent-green)' }}>Week Complete! Great job! 🎉</p>
        </div>
      )}
    </div>
  );
};
