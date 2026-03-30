import React from 'react';
import { X } from 'lucide-react';
import { AuthPage } from './AuthPage';

interface Props {
  onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, backdropFilter: 'blur(4px)',
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '-2.5rem', right: 0,
            background: 'none', border: 'none',
            color: 'var(--text-secondary)', cursor: 'pointer',
          }}
        >
          <X size={24} />
        </button>
        <AuthPage />
      </div>
    </div>
  );
};
