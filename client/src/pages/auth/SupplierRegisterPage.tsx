import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthFrame from '@/components/auth/AuthFrame';
import { useAuth } from '@/context/AuthContext';

export default function SupplierRegisterPage() {
  const { registerSupplier } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', businessName: '', email: '', phone: '', password: '', passwordConfirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateField(field: keyof typeof form) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError('');
    setSubmitting(true);
    try {
      await registerSupplier({
        name: form.name.trim(),
        businessName: form.businessName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
      });
      navigate('/supplier', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFrame title="Create a supplier account." description="Set up your account to manage station details, terminals, charging requests, and earnings." storyTitle="Make your stations easier to find." storyCopy="Share clear availability and station details with the EV drivers who need them.">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-split"><div className="field"><label htmlFor="supplier-name">Contact name</label><input id="supplier-name" name="name" type="text" placeholder="Enter your full name" autoComplete="name" required value={form.name} onChange={updateField('name')} /></div><div className="field"><label htmlFor="business-name">Business name</label><input id="business-name" name="businessName" type="text" placeholder="Enter your business name" required value={form.businessName} onChange={updateField('businessName')} /></div></div>
        <div className="form-split"><div className="field"><label htmlFor="supplier-email">Business email</label><input id="supplier-email" name="email" type="email" placeholder="team@business.com" autoComplete="email" required value={form.email} onChange={updateField('email')} /></div><div className="field"><label htmlFor="supplier-phone">Mobile number</label><input id="supplier-phone" name="phone" type="tel" placeholder="0300 1234567" autoComplete="tel" required value={form.phone} onChange={updateField('phone')} /></div></div>
        <div className="field"><label htmlFor="supplier-password">Password</label><input id="supplier-password" name="password" type="password" placeholder="Use at least 8 characters" autoComplete="new-password" minLength={8} required value={form.password} onChange={updateField('password')} /></div>
        <div className="field"><label htmlFor="supplier-password-confirm">Confirm password</label><input id="supplier-password-confirm" name="passwordConfirm" type="password" placeholder="Repeat your password" autoComplete="new-password" minLength={8} required value={form.passwordConfirm} onChange={updateField('passwordConfirm')} /></div>
        <label className="form-check"><input type="checkbox" required /> I understand that supplier accounts require verification.</label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="gc-button gc-button-primary auth-submit" type="submit" disabled={submitting}>{submitting ? 'Creating account…' : 'Create supplier account'}</button>
      </form>
      <p className="auth-footer">Already have an account? <Link className="gc-link" to="/login">Sign in</Link></p>
    </AuthFrame>
  );
}
