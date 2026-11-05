import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AuthFrame from '@/components/auth/AuthFrame';

export default function CustomerRegisterPage() {
  const [message, setMessage] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('Account creation will be available when the account service is connected.');
  }

  return (
    <AuthFrame title="Create your driver account." description="Add your details now, then save your vehicle and find compatible charging stations." previewTo="/demo" previewLabel="View demo workspace">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field"><label htmlFor="customer-name">Full name</label><input id="customer-name" type="text" placeholder="Enter your full name" autoComplete="name" required /></div>
        <div className="form-split"><div className="field"><label htmlFor="customer-email">Email</label><input id="customer-email" type="email" placeholder="you@example.com" autoComplete="email" required /></div><div className="field"><label htmlFor="customer-phone">Mobile number</label><input id="customer-phone" type="tel" placeholder="0300 1234567" autoComplete="tel" required /></div></div>
        <div className="field"><label htmlFor="customer-password">Password</label><input id="customer-password" type="password" placeholder="Use at least 8 characters" autoComplete="new-password" minLength={8} required /></div>
        <label className="form-check"><input type="checkbox" required /> I agree to the terms and privacy policy.</label>
        {message && <p className="success-message" role="status">{message}</p>}
        <button className="gc-button gc-button-primary auth-submit" type="submit">Create driver account</button>
      </form>
      <p className="auth-footer">Already have an account? <Link className="gc-link" to="/login">Sign in</Link></p>
    </AuthFrame>
  );
}
