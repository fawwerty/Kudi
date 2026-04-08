/**
 * Kudi — Google Auth Components
 * GoogleSignInButton  → one-tap sign in
 * GoogleVerifyModal   → re-auth for high-value transactions
 */
import { useGoogleLogin, GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Google Sign-In Button ──────────────────────────────────────────────────────
export function GoogleSignInButton({ onSuccess, onError, label = 'Continue with Google' }) {
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google sign-in failed');
      // Store tokens
      localStorage.setItem('bankly_access_token', data.accessToken);
      localStorage.setItem('bankly_refresh_token', data.refreshToken);
      onSuccess?.(data.user, data.accessToken);
    } catch (err) {
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => onError?.('Google sign-in was cancelled or failed.')}
      useOneTap={false}
      theme="outline"
      size="large"
      width="100%"
      text={label === 'Continue with Google' ? 'continue_with' : 'signin_with'}
      shape="rectangular"
      logo_alignment="left"
    />
  );
}

// ── Google Verify Modal ────────────────────────────────────────────────────────
// Used to re-authenticate for high-value transactions (>₵500)
export function GoogleVerifyModal({ amount, onVerified, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSuccess = async (credentialResponse) => {
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('bankly_access_token');
      const res = await fetch(`${API_BASE}/auth/google/verify-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
          amount,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.verified) throw new Error(data.error || 'Verification failed');
      onVerified?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-overlay" onClick={onCancel}>
      <div
        className="sci"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg,#0f0d22,#0d0b1f)',
          border: '1px solid #2d2a5e',
          borderRadius: 24, padding: 36,
          width: '100%', maxWidth: 420,
          boxShadow: '0 32px 80px rgba(0,0,0,.8)',
          textAlign: 'center',
        }}
      >
        {/* Shield icon */}
        <div style={{
          width: 72, height: 72, margin: '0 auto 20px',
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, boxShadow: '0 8px 32px rgba(99,102,241,.4)',
        }}>🛡️</div>

        <h2 style={{ fontFamily: 'Bricolage Grotesque,sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
          Verify Your Identity
        </h2>
        <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>
          This transfer of <strong style={{ color: '#f1f5f9' }}>₵{Number(amount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}</strong> requires Google verification.
        </p>
        <p style={{ color: '#475569', fontSize: 12, marginBottom: 24 }}>
          Your identity is verified by Google — Kudi never sees your password.
        </p>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px 0' }}>
            <div className="spinner" />
            <span style={{ color: '#94a3b8', fontSize: 14 }}>Verifying with Google…</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setError('Google verification cancelled.')}
              useOneTap={false}
              theme="outline"
              size="large"
              width="100%"
              text="continue_with"
              shape="rectangular"
            />
            <button
              className="btn-ghost"
              onClick={onCancel}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Cancel Transaction
            </button>
          </div>
        )}

        {error && (
          <div style={{
            marginTop: 14, padding: '10px 14px',
            background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
            borderRadius: 10, fontSize: 13, color: '#fca5a5',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Security badges */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
          {['🔒 SSL Encrypted', '🇬🇭 Ghana Compliant', '⚡ AI Fraud Check'].map(b => (
            <span key={b} style={{
              fontSize: 11, color: '#475569',
              background: '#111028', border: '1px solid #1e1b3a',
              borderRadius: 20, padding: '3px 10px',
            }}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
