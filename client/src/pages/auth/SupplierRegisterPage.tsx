import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AuthFrame from '@/components/auth/AuthFrame';

export default function SupplierRegisterPage() {
  const [message, setMessage] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('Supplier account creation will be available when verification services are connected.');
  }

  return (
    <AuthFrame title="Create a supplier account." description="Set up your account to manage station details, terminals, charging requests, and earnings." storyTitle="Make your stations easier to find." storyCopy="Share clear availability and station details with the EV drivers who need them." previewTo="/demo" previewLabel="View demo workspace">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-split"><div className="field"><label htmlFor="supplier-name">Contact name</label><input id="supplier-name" type="text" placeholder="Enter your full name" autoComplete="name" required /></div><div className="field"><label htmlFor="business-name">Business name</label><input id="business-name" type="text" placeholder="Enter your business name" required /></div></div>
        <div className="form-split"><div className="field"><label htmlFor="supplier-email">Business email</label><input id="supplier-email" type="email" placeholder="team@business.com" autoComplete="email" required /></div><div className="field"><label htmlFor="supplier-phone">Mobile number</label><input id="supplier-phone" type="tel" placeholder="0300 1234567" autoComplete="tel" required /></div></div>
        <div className="field"><label htmlFor="supplier-password">Password</label><input id="supplier-password" type="password" placeholder="Use at least 8 characters" autoComplete="new-password" minLength={8} required /></div>
        <label className="form-check"><input type="checkbox" required /> I understand that supplier accounts require verification.</label>
        {message && <p className="success-message" role="status">{message}</p>}
        <button className="gc-button gc-button-primary auth-submit" type="submit">Create supplier account</button>
      </form>
      <p className="auth-footer">Already have an account? <Link className="gc-link" to="/login">Sign in</Link></p>
    </AuthFrame>
  );
}
