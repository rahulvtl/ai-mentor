import React, { useState } from 'react';
import { Sparkles, Mail, Lock, ArrowRight, Loader2, UserRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setConfirmMsg('');
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, name);
      if (error) {
        setError(error);
      } else {
        setConfirmMsg('Check your email for a confirmation link!');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      }
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', width: '100vw',
      background: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% 20%, rgba(59,130,246,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 70% 60%, rgba(139,92,246,0.04) 0%, transparent 50%)',
      padding: '1rem',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        padding: '2.5rem',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Sparkles color="var(--accent-blue)" size={28} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.05em', margin: 0 }}>
              AI MENTOR
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            {isSignUp ? 'Create your account to start learning' : 'Welcome back! Sign in to continue'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Name (sign up only) */}
          {isSignUp && (
            <div style={{ position: 'relative' }}>
              <UserRound size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem',
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                  borderRadius: '12px', color: 'var(--text-primary)',
                  fontSize: '0.95rem', outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
          )}

          {/* Email */}
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem',
                background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                borderRadius: '12px', color: 'var(--text-primary)',
                fontSize: '0.95rem', outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem',
                background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                borderRadius: '12px', color: 'var(--text-primary)',
                fontSize: '0.95rem', outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>

          {/* Error / Confirm */}
          {error && (
            <div style={{
              padding: '0.65rem 1rem', borderRadius: '10px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: 'var(--accent-red)', fontSize: '0.85rem',
            }}>
              {error}
            </div>
          )}
          {confirmMsg && (
            <div style={{
              padding: '0.65rem 1rem', borderRadius: '10px',
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              color: 'var(--accent-green)', fontSize: '0.85rem',
            }}>
              {confirmMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.85rem', borderRadius: '12px',
              background: 'var(--accent-blue)', border: 'none',
              color: 'white', fontSize: '1rem', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
          >
            {loading ? <Loader2 size={18} className="animate-pulse" /> : <ArrowRight size={18} />}
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setConfirmMsg(''); }}
              style={{
                background: 'none', border: 'none',
                color: 'var(--accent-blue)', fontSize: '0.85rem',
                fontWeight: 600, cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};
