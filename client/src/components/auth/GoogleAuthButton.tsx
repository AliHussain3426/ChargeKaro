import { getGoogleAuthStartUrl } from '@/services/api';

type GoogleAuthIntent = 'login' | 'customer_register' | 'supplier_register';

interface GoogleAuthButtonProps {
  intent: GoogleAuthIntent;
  businessName?: string;
  label?: string;
  disabled?: boolean;
}

function GoogleIcon() {
  return (
    <svg className="auth-google-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M23.49 12.27c0-.85-.07-1.64-.21-2.41H12v4.56h6.44a5.5 5.5 0 0 1-2.39 3.62v3h3.86c2.26-2.08 3.58-5.15 3.58-8.77Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.86-3c-1.07.72-2.44 1.15-4.09 1.15-3.15 0-5.82-2.13-6.77-4.99H1.24v3.09A11.99 11.99 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.23 14.25A7.2 7.2 0 0 1 4.86 12c0-.78.13-1.54.37-2.25V6.66H1.24A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.24 5.34l3.99-3.09Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.58 1.79l3.43-3.43C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.24 6.66l3.99 3.09c.95-2.86 3.62-4.98 6.77-4.98Z" />
    </svg>
  );
}

export default function GoogleAuthButton({ intent, businessName, label = 'Continue with Google', disabled }: GoogleAuthButtonProps) {
  const href = getGoogleAuthStartUrl(intent, businessName);

  if (disabled) {
    return (
      <span className="auth-google-button" aria-disabled="true" role="link" aria-label={label}>
        <GoogleIcon />
        <span>{label}</span>
      </span>
    );
  }

  return (
    <a className="auth-google-button" href={href} aria-label={label}>
      <GoogleIcon />
      <span>{label}</span>
    </a>
  );
}