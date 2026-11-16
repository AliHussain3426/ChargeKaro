import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthFrame from '@/components/auth/AuthFrame';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <AuthFrame title="Sign in to ChargeKaro." description="Use your account details to manage charging plans, stations, or platform operations.">
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
