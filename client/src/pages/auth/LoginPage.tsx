import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AuthFrame from '@/components/auth/AuthFrame';

export default function LoginPage() {
  const [message, setMessage] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('Sign-in will be available when account services are connected.');
  }

  return (
    <AuthFrame title="Sign in to GreenCharge." description="Use your account details to manage charging plans, stations, or platform operations." previewTo="/demo" previewLabel="View demo workspace">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" placeholder="you@example.com" autoComplete="email" required /></div>
        <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" placeholder="Enter your password" autoComplete="current-password" required /></div>
        <div className="form-help"><label className="form-check"><input type="checkbox" /> Keep me signed in</label><Link className="gc-link" to="/forgot-password">Reset password</Link></div>
        {message && <p className="success-message" role="status">{message}</p>}
        <button className="gc-button gc-button-primary auth-submit" type="submit">Sign in</button>
      </form>
      <p className="auth-footer">New to GreenCharge? <Link className="gc-link" to="/register">Create an account</Link></p>
    </AuthFrame>
  );
}
