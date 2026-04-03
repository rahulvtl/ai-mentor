import React, { useEffect, useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { ExternalLink, ChevronDown, BookOpen, Clock, FileText } from 'lucide-react';
import type { LearningModule } from '../../services/AiService';
import 'katex/dist/katex.min.css';

interface Props {
  module: LearningModule;
  onStateChange: (state: any) => void;
}

/** Extract the first N sentences from a paragraph of text. */
function firstSentences(text: string, n: number): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  return sentences.slice(0, n).map((s) => s.trim()).filter(Boolean);
}

/** Estimate reading time in minutes. */
function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// ── Section accordion item ─────────────────────────────────────────────────
function SectionItem({
  title,
  text,
  anchor,
  articleUrl,
  defaultOpen = false,
}: {
  title: string;
  text: string;
  anchor: string;
  articleUrl?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'var(--bg-tertiary)',
      }}
    >
      {/* Section header */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.1rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          gap: '0.75rem',
          textAlign: 'left',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', flex: 1 }}>
          {title}
        </span>
        <ChevronDown
          size={16}
          color="var(--text-secondary)"
          style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {/* Section body */}
      {open && (
        <div style={{ padding: '0 1.1rem 1rem', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.82)', margin: '0.85rem 0 0' }}>
            {text}
          </p>
          {articleUrl && anchor && (
            <a
              href={`${articleUrl}#${anchor}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                marginTop: '0.65rem', fontSize: '0.73rem', color: 'var(--accent-blue)',
                textDecoration: 'none', opacity: 0.8,
              }}
            >
              <ExternalLink size={11} /> Read full section on Wikipedia
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export const ArticleExplorer: React.FC<Props> = ({ module, onStateChange }) => {
  useEffect(() => {
    onStateChange({ readingTopic: module.topic });
  }, [module.topic, onStateChange]);

  const hasWikiSections = (module.wikiSections?.length ?? 0) > 0;
  const hasFormulaSections = (module.articleSections?.length ?? 0) > 0;
  const keyPoints = module.articleDescription ? firstSentences(module.articleDescription, 3) : [];
  const totalText = [
    module.articleDescription ?? '',
    ...(module.wikiSections?.map((s) => s.text) ?? []),
  ].join(' ');
  const mins = readingTime(totalText);

  return (
    <div
      className="animate-fade-in"
      style={{ width: '100%', height: '100%', overflowY: 'auto', background: 'var(--bg-primary)' }}
    >
      {/* ── Hero image ── */}
      {module.articleImage && (
        <div style={{
          background: '#0d1117',
          display: 'flex', justifyContent: 'center',
          padding: '1.5rem 2rem 0',
        }}>
          <img
            src={module.articleImage}
            alt={module.topic}
            style={{
              maxWidth: '100%', maxHeight: '280px',
              objectFit: 'contain', borderRadius: '8px',
            }}
          />
        </div>
      )}

      {/* ── Title bar ── */}
      <div style={{ padding: '1.25rem 2rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <BookOpen size={14} color="var(--text-secondary)" />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Article
          </span>
          <span style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>·</span>
          <Clock size={12} color="var(--text-secondary)" />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{mins} min read</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, lineHeight: 1.2, color: 'var(--text-primary, white)', letterSpacing: '-0.02em' }}>
          {module.topic}
        </h1>
        {module.articleUrl && (
          <a
            href={module.articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.6rem', fontSize: '0.73rem', color: 'var(--text-secondary)', textDecoration: 'none' }}
          >
            <ExternalLink size={11} /> Open on Wikipedia
          </a>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 2rem 4rem' }}>

        {/* Key Points card */}
        {keyPoints.length > 0 && (
          <div
            style={{
              background: 'rgba(59,130,246,0.07)',
              border: '1px solid rgba(59,130,246,0.25)',
              borderRadius: '12px',
              padding: '1.1rem 1.25rem',
              marginBottom: '1.75rem',
            }}
          >
            <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--accent-blue)', margin: '0 0 0.65rem' }}>
              Key Points
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {keyPoints.map((pt, i) => (
                <li key={i} style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.6 }}>{pt}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Introduction */}
        {module.articleDescription && (
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.78)', margin: 0 }}>
              {module.articleDescription}
            </p>
          </div>
        )}

        {/* Wikipedia sections */}
        {hasWikiSections && (
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-secondary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={12} /> Article Sections
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {module.wikiSections!.map((sec, i) => (
                <SectionItem
                  key={i}
                  title={sec.title}
                  text={sec.text}
                  anchor={sec.anchor}
                  articleUrl={module.articleUrl}
                  defaultOpen={i === 0}
                />
              ))}
            </div>
          </div>
        )}

        {/* Math / formula sections (existing STEM content) */}
        {hasFormulaSections && (
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
              Formulas & Identities
            </p>
            {module.articleSections!.map((section, idx) => (
              <div key={idx} style={{ marginBottom: '2rem' }}>
                <h2
                  style={{
                    fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontWeight: 700,
                  }}
                >
                  {idx + 1}. {section.title}
                </h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {section.items.map((item, idy) => (
                    <li key={idy} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>•</span>
                        <strong>{item.text}:</strong>
                        {item.inlineMath && <span style={{ marginLeft: '0.25rem' }}><InlineMath math={item.inlineMath} /></span>}
                      </div>
                      {item.blockMath && (
                        <div style={{ padding: '1.25rem', background: 'var(--bg-tertiary)', borderRadius: '10px', overflowX: 'auto', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                          <BlockMath math={item.blockMath} />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!module.articleDescription && !hasWikiSections && !hasFormulaSections && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '3rem' }}>
            <BookOpen size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p>No content found. Try asking the AI Tutor directly in the Chat tab.</p>
          </div>
        )}

        {/* Wikipedia attribution */}
        {(module.articleDescription || hasWikiSections) && module.articleUrl && (
          <div
            style={{
              marginTop: '2.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', flexShrink: 0 }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Content sourced from{' '}
              <a href={module.articleUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>
                Wikipedia
              </a>
              {' '}under the Creative Commons Attribution-ShareAlike licence.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
