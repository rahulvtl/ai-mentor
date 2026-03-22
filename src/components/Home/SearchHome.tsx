import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Sparkles, Flame, CalendarDays, FlaskConical, TrendingUp } from 'lucide-react';
import { AiService, type LearningModule } from '../../services/AiService';
import { getStreak, getWeakTopics, type StreakData } from '../../services/studyDataService';
import '../../index.css';

interface Props {
  onModuleLoad: (module: LearningModule) => void;
  onOpenPlanner: () => void;
  onOpenAnalyser: () => void;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export const SearchHome: React.FC<Props> = ({ onModuleLoad, onOpenPlanner, onOpenAnalyser }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [streak, setStreak] = useState<StreakData>({ count: 0, lastStudyDate: '', totalDaysStudied: 0 });
  const [weakTopics, setWeakTopics] = useState<{ topic: string; count: number }[]>([]);
  const isMobile = useIsMobile();
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStreak(getStreak());
    setWeakTopics(getWeakTopics(5));
  }, []);

  // Debounced autocomplete fetch
  const fetchAutocomplete = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setAutocompleteSuggestions([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          action: 'opensearch', search: q, limit: '6',
          namespace: '0', format: 'json', origin: '*',
        });
        const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
        if (res.ok) {
          const data = await res.json() as [string, string[]];
          const titles: string[] = data[1] ?? [];
          setAutocompleteSuggestions(titles);
          setShowDropdown(titles.length > 0);
          setActiveIndex(-1);
        }
      } catch { /* silently ignore */ }
    }, 280);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const performSearch = async (q: string) => {
    if (!q.trim()) return;
    setShowDropdown(false);
    setAutocompleteSuggestions([]);
    setIsSearching(true);
    try {
      const module = await AiService.searchTopic(q);
      onModuleLoad(module);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); performSearch(query); };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    fetchAutocomplete(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || autocompleteSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, autocompleteSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      const chosen = autocompleteSuggestions[activeIndex];
      setQuery(chosen);
      performSearch(chosen);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const suggestions = ["Area of a Rectangle", "Interactive Vectors", "Pythagoras Theorem", "Newton's Laws of Motion"];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: isMobile ? 'flex-start' : 'center',
      minHeight: '100vh', width: '100vw',
      padding: isMobile ? '1rem' : '2rem',
      paddingTop: isMobile ? '5rem' : '2rem',
      background: 'var(--bg-primary)', position: 'relative',
      overflowY: 'auto',
    }}>

      {/* Top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '0.65rem 1rem' : '1.25rem 2rem',
        background: 'var(--bg-primary)', zIndex: 20,
        borderBottom: isMobile ? '1px solid var(--border-color)' : 'none',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles color="var(--accent-blue)" size={isMobile ? 18 : 24} />
          <h1 style={{ fontSize: isMobile ? '0.95rem' : '1.2rem', fontWeight: 700, letterSpacing: '0.05em', margin: 0 }}>
            AI MENTOR
          </h1>
        </div>

        {/* Right side: streak + buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.4rem' : '0.75rem' }}>
          {streak.count > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: isMobile ? '0.3rem 0.6rem' : '0.4rem 0.85rem', borderRadius: '20px',
              background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)',
              color: '#F59E0B', fontSize: isMobile ? '0.72rem' : '0.8rem', fontWeight: 700,
            }}>
              <Flame size={13} />
              {streak.count}🔥
            </div>
          )}

          <button
            onClick={onOpenPlanner}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: isMobile ? '0.35rem 0.6rem' : '0.4rem 0.85rem', borderRadius: '20px',
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
              color: 'var(--accent-blue)', fontSize: isMobile ? '0.72rem' : '0.8rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <CalendarDays size={13} />
            {!isMobile && 'Study Planner'}
            {isMobile && 'Planner'}
          </button>

          <button
            onClick={onOpenAnalyser}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: isMobile ? '0.35rem 0.6rem' : '0.4rem 0.85rem', borderRadius: '20px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: 'var(--accent-red)', fontSize: isMobile ? '0.72rem' : '0.8rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <FlaskConical size={13} />
            {!isMobile && 'Analyse Test'}
            {isMobile && 'Test'}
          </button>
        </div>
      </div>

      {/* Main search area */}
      <div style={{ textAlign: 'center', maxWidth: '800px', width: '100%', marginTop: isMobile ? '1rem' : '-8vh' }}>
        <h2 style={{
          fontSize: isMobile ? '1.6rem' : '3rem',
          marginBottom: isMobile ? '1.5rem' : '2.5rem',
          fontWeight: 700, lineHeight: 1.2,
          background: 'linear-gradient(135deg, #fff 0%, #9ca3af 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          What do you want to learn today?
        </h2>

        <form onSubmit={handleSearch} style={{ width: '100%', position: 'relative', isolation: 'isolate' }}>
          <div style={{ position: 'absolute', inset: -4, background: 'linear-gradient(45deg, var(--accent-blue), var(--accent-purple))', borderRadius: '54px', zIndex: -1, opacity: 0.5, filter: 'blur(10px)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder={isMobile ? 'Search any topic…' : 'Search any topic in Maths, Physics, Chemistry, Bio...'}
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (autocompleteSuggestions.length > 0) setShowDropdown(true); }}
            autoComplete="off"
            style={{
              width: '100%',
              padding: isMobile ? '1rem 3.5rem 1rem 1.25rem' : '1.5rem 4.5rem 1.5rem 2rem',
              fontSize: '1rem',
              borderRadius: showDropdown ? '20px 20px 0 0' : '50px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'var(--bg-secondary)', color: 'var(--text-primary)',
              outline: 'none', transition: 'border-radius 0.15s', zIndex: 1,
              boxSizing: 'border-box',
            }}
          />
          <button
            type="submit"
            disabled={isSearching}
            style={{
              position: 'absolute', right: isMobile ? '0.6rem' : '1rem', top: '50%',
              transform: 'translateY(-50%)',
              background: 'var(--accent-blue)', border: 'none',
              width: isMobile ? '2.5rem' : '3.5rem', height: isMobile ? '2.5rem' : '3.5rem',
              borderRadius: '50%',
              color: 'white', cursor: isSearching ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 2,
            }}
          >
            {isSearching
              ? <div className="animate-pulse" style={{ width: 14, height: 14, borderRadius: 7, background: 'white' }} />
              : <Search size={24} />
            }
          </button>

          {/* Autocomplete dropdown */}
          {showDropdown && autocompleteSuggestions.length > 0 && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: 'var(--bg-secondary)',
                border: '1px solid rgba(255,255,255,0.1)', borderTop: 'none',
                borderRadius: '0 0 26px 26px',
                overflow: 'hidden', zIndex: 100,
                boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
              }}
            >
              {autocompleteSuggestions.map((s, i) => (
                <div
                  key={s}
                  onMouseDown={(e) => { e.preventDefault(); setQuery(s); performSearch(s); }}
                  onMouseEnter={() => setActiveIndex(i)}
                  style={{
                    padding: '0.85rem 2rem',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    cursor: 'pointer',
                    background: activeIndex === i ? 'rgba(59,130,246,0.12)' : 'transparent',
                    color: activeIndex === i ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: '1rem',
                    transition: 'background 0.1s',
                    borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}
                >
                  <Search size={14} style={{ opacity: 0.4, flexShrink: 0 }} />
                  {s}
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Suggestions */}
        <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Suggested:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              className="btn"
              style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}
              onClick={() => { setQuery(s); performSearch(s); }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Weak topics heatmap */}
        {weakTopics.length > 0 && (
          <div style={{
            marginTop: '2rem', padding: '1rem 1.25rem',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px', textAlign: 'left',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <TrendingUp size={14} color="var(--accent-red)" />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
                Your Most Studied Topics
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {weakTopics.map(({ topic, count }, i) => {
                const intensity = i === 0 ? 'var(--accent-red)' : i === 1 ? '#F59E0B' : 'var(--accent-blue)';
                return (
                  <button
                    key={topic}
                    onClick={() => { setQuery(topic); performSearch(topic); }}
                    style={{
                      padding: '0.3rem 0.75rem', borderRadius: '20px',
                      background: 'rgba(255,255,255,0.04)', border: `1px solid ${intensity}44`,
                      color: intensity, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                    }}
                  >
                    {topic} <span style={{ opacity: 0.6, fontSize: '0.68rem' }}>({count}q)</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats row */}
        {streak.totalDaysStudied > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              🎯 <strong style={{ color: 'white' }}>{streak.totalDaysStudied}</strong> total days studied
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              🔥 Best streak: <strong style={{ color: 'white' }}>{streak.count}</strong> days
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
