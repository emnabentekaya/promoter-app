
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/authService';
import { Building2, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import './LoginPage.css'
export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const loginResult = await authService.login(email, password);
      switch (loginResult) {
        case true:
          navigate('/');
          return;
        case false:
          setError('Identifiants incorrects.');
          return;
        default:
          setError('Une erreur est survenue.');
          return;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      padding: '20px',
      boxSizing: 'border-box',

    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '40px 36px',
        boxShadow: 'var(--shadow)',
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: 14,
            background: '#38a9b84c',
            marginBottom: 16,
          }}>
            <Building2 size={28} color='#38a9b8' />
          </div>
          <h2 style={{ fontSize: 22, margin: '0 0 6px', letterSpacing: '-0.4px', color: 'var(--text-h)' }}>
            Connexion
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text)', margin: 0 }}>
            Accédez à votre espace de gestion
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#dc2626',
            borderRadius: 8,
            padding: '11px 14px',
            fontSize: 13,
            marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 6,
              color: 'var(--text-h)',
            }}>
              Adresse e-mail
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={15}
                color="var(--text)"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                autoComplete="email"
                placeholder="vous@exemple.com"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'var(--bg)',
                  color: 'var(--text-h)',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                  fontFamily: 'inherit',
                }}
                onFocus={e => (e.target.style.borderColor = '#38a9b8')}
                onBlur={e => (e.target.style.borderColor = '#38a9b84c')}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 28 }}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 6,
              color: 'var(--text-h)',
            }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={15}
                color="var(--text)"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 36px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'var(--bg)',
                  color: 'var(--text-h)',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                  fontFamily: 'inherit',
                }}
                onFocus={e => (e.target.style.borderColor = '#38a9b8')}
                onBlur={e => (e.target.style.borderColor = '#38a9b874')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text)',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{width: '100%',padding: '11px',background: loading ? 'var(--accent-border)' : '#38a9b8',
              color: '#fff',border: 'none',borderRadius: 8,fontSize: 15,fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',letterSpacing: '0.2px',fontFamily: 'inherit',transition: 'opacity 0.15s'
            }}
          >
            {loading ? 'Connexion en cours…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
