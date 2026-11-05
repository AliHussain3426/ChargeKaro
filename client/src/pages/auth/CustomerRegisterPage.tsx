import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AuthFrame from '@/components/auth/AuthFrame';

export default function CustomerRegisterPage() {
  const [message, setMessage] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('Your customer account form is ready. Account creation will be connected when the authentication API is available.');
  }

  return (
    <AuthFrame title="Start charging smarter." description="Set up your driver account. You can add a vehicle and explore compatible stations next." previewTo="/demo" previewLabel="Open demo dashboard">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field"><label htmlFor="customer-name">Full name</label><input id="customer-name" type="text" placeholder="Your full name" autoComplete="name" required /></div>
        <div className="form-split"><div className="field"><label htmlFor="customer-email">Email address</label><input id="customer-email" type="email" placeholder="you@example.com" autoComplete="email" required /></div><div className="field"><label htmlFor="customer-phone">Phone number</label><input id="customer-phone" type="tel" placeholder="0300 1234567" autoComplete="tel" required /></div></div>
        <div className="field"><label htmlFor="customer-password">Create password</label><input id="customer-password" type="password" placeholder="At least 8 characters" autoComplete="new-password" minLength={8} required /></div>
        <label className="form-check"><input type="checkbox" required /> I agree to the platform terms and privacy policy.</label>
        {message && <p className="success-message" role="status">{message}</p>}
        <button className="gc-button gc-button-primary auth-submit" type="submit">Create driver account</button>
      </form>
      <p className="auth-footer">Already have an account? <Link className="gc-link" to="/login">Sign in</Link></p>
    </AuthFrame>
  );
}
