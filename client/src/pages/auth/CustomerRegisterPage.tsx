import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthFrame from '@/components/auth/AuthFrame';
import { useAuth } from '@/context/AuthContext';

export default function CustomerRegisterPage() {
  const { registerCustomer } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', passwordConfirm: '' });
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
      await registerCustomer({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
      });
      navigate('/customer', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFrame title="Create your driver account." description="Add your details now, then save your vehicle and find compatible charging stations.">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field"><label htmlFor="customer-name">Full name</label><input id="customer-name" name="name" type="text" placeholder="Enter your full name" autoComplete="name" required value={form.name} onChange={updateField('name')} /></div>
        <div className="form-split"><div className="field"><label htmlFor="customer-email">Email</label><input id="customer-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required value={form.email} onChange={updateField('email')} /></div><div className="field"><label htmlFor="customer-phone">Mobile number</label><input id="customer-phone" name="phone" type="tel" placeholder="0300 1234567" autoComplete="tel" required value={form.phone} onChange={updateField('phone')} /></div></div>
        <div className="field"><label htmlFor="customer-password">Password</label><input id="customer-password" name="password" type="password" placeholder="Use at least 8 characters" autoComplete="new-password" minLength={8} required value={form.password} onChange={updateField('password')} /></div>
        <div className="field"><label htmlFor="customer-password-confirm">Confirm password</label><input id="customer-password-confirm" name="passwordConfirm" type="password" placeholder="Repeat your password" autoComplete="new-password" minLength={8} required value={form.passwordConfirm} onChange={updateField('passwordConfirm')} /></div>
        <label className="form-check"><input type="checkbox" required /> I agree to the terms and privacy policy.</label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="gc-button gc-button-primary auth-submit" type="submit" disabled={submitting}>{submitting ? 'Creating account…' : 'Create driver account'}</button>
      </form>
      <p className="auth-footer">Already have an account? <Link className="gc-link" to="/login">Sign in</Link></p>
    </AuthFrame>
  );
}
