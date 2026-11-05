import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AuthFrame from '@/components/auth/AuthFrame';

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('Password reset delivery will be connected when the authentication service is available.');
  }

  return (
    <AuthFrame title="Reset your password." description="Enter the address connected to your account and we will guide you through a secure reset." previewTo="/demo" previewLabel="Open demo dashboard">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field"><label htmlFor="recovery-email">Email address</label><input id="recovery-email" type="email" placeholder="you@example.com" autoComplete="email" required /></div>
        {message && <p className="success-message" role="status">{message}</p>}
        <button className="gc-button gc-button-primary auth-submit" type="submit">Send reset link</button>
      </form>
      <p className="auth-footer">Remembered your password? <Link className="gc-link" to="/login">Return to sign in</Link></p>
    </AuthFrame>
  );
}
