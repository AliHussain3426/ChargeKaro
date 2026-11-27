import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthFrame from '@/components/auth/AuthFrame';
import { getGoogleAuthStartUrl } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [supplierBusinessName, setSupplierBusinessName] = useState('');
  const [showGoogleRoleChooser, setShowGoogleRoleChooser] = useState(false);
  const [googleRole, setGoogleRole] = useState<'driver' | 'supplier' | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      setError(oauthError);
      const next = new URLSearchParams(searchParams);
      next.delete('error');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError('');
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      const homePath =
        user.role === 'SUPPLIER' ? '/supplier' : user.role === 'ADMIN' ? '/admin' : '/customer';
      navigate(homePath, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function startGoogleAuth(role: 'driver' | 'supplier') {
    const intent = role === 'supplier' ? 'supplier_register' : 'login';
    const businessName = role === 'supplier' ? supplierBusinessName.trim() : undefined;
    window.location.href = getGoogleAuthStartUrl(intent, businessName);
  }

  return (
    <AuthFrame title="Sign in to ChargeKaro." description="Use your account details to manage charging plans, stations, or platform operations.">
      {!showGoogleRoleChooser ? (
        <button
          type="button"
          className="auth-google-button"
          onClick={() => setShowGoogleRoleChooser(true)}
          aria-label="Continue with Google"
        >
          <svg className="auth-google-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path fill="#4285F4" d="M23.49 12.27c0-.85-.07-1.64-.21-2.41H12v4.56h6.44a5.5 5.5 0 0 1-2.39 3.62v3h3.86c2.26-2.08 3.58-5.15 3.58-8.77Z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.86-3c-1.07.72-2.44 1.15-4.09 1.15-3.15 0-5.82-2.13-6.77-4.99H1.24v3.09A11.99 11.99 0 0 0 12 24Z" />
            <path fill="#FBBC05" d="M5.23 14.25A7.2 7.2 0 0 1 4.86 12c0-.78.13-1.54.37-2.25V6.66H1.24A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.24 5.34l3.99-3.09Z" />
            <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.58 1.79l3.43-3.43C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.24 6.66l3.99 3.09c.95-2.86 3.62-4.98 6.77-4.98Z" />
          </svg>
          <span>Continue with Google</span>
        </button>
      ) : (
        <div className="auth-form auth-google-role-panel">
          <p className="auth-google-role-title">Choose account type</p>
          <p className="auth-google-role-copy">Select how you want to continue with Google. New station owner accounts need admin approval before login.</p>
          <div style={{ display: 'grid', gap: 8 }}>
            <button type="button" className="gc-button gc-button-primary auth-submit" style={{ marginTop: 0 }} onClick={() => { setGoogleRole('driver'); startGoogleAuth('driver'); }}>
              Continue as Driver
            </button>
            <button type="button" className="auth-google-button" style={{ height: 44, minHeight: 44 }} onClick={() => setGoogleRole('supplier')}>
              Continue as Station Owner
            </button>
          </div>
          {googleRole === 'supplier' && (
            <div className="field" style={{ marginTop: 4 }}>
              <label htmlFor="google-supplier-business">Business name (optional)</label>
              <input
                id="google-supplier-business"
                type="text"
                placeholder="Enter business name for station owner account"
                value={supplierBusinessName}
                onChange={(event) => setSupplierBusinessName(event.target.value)}
              />
              <button type="button" className="gc-button gc-button-primary auth-submit" style={{ marginTop: 8 }} onClick={() => startGoogleAuth('supplier')}>
                Continue with Google as Station Owner
              </button>
            </div>
          )}
          <button type="button" className="gc-link" style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', fontSize: 12 }} onClick={() => { setShowGoogleRoleChooser(false); setGoogleRole(null); }}>
            Back
          </button>
        </div>
      )}
      <div className="auth-divider" aria-hidden="true"><span>or continue with email</span></div>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(error)} /></div>
        <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" placeholder="Enter your password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(error)} /></div>
        <div className="form-help"><label className="form-check"><input type="checkbox" /> Keep me signed in</label><Link className="gc-link" to="/forgot-password">Reset password</Link></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="gc-button gc-button-primary auth-submit" type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="auth-footer">New to ChargeKaro? <Link className="gc-link" to="/register">Create an account</Link></p>
    </AuthFrame>
  );
}
