import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AuthFrame from '@/components/auth/AuthFrame';
import { authService } from '@/services/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const result = await authService.forgotPassword(email.trim());
      setMessage(result || 'Password reset instructions were generated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to request a password reset. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFrame title="Reset your password." description="Enter the address connected to your account and we will guide you through a secure reset.">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field"><label htmlFor="recovery-email">Email address</label><input id="recovery-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></div>
        {message && <p className="success-message" role="status">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="gc-button gc-button-primary auth-submit" type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Send reset link'}</button>
      </form>
      <p className="auth-footer">Remembered your password? <Link className="gc-link" to="/login">Return to sign in</Link></p>
    </AuthFrame>
  );
}
