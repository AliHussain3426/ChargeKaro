import type { ReactNode } from 'react';
import { ArrowLeft, ArrowUpRight, CircleCheck, ShieldCheck, Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './auth.css';

interface AuthFrameProps {
  title: string;
  description: string;
  storyTitle?: string;
  storyCopy?: string;
  previewTo?: string;
  previewLabel?: string;
  children: ReactNode;
}

export default function AuthFrame({
  title,
  description,
  storyTitle = 'Make every charging stop easier to plan.',
  storyCopy = 'Keep your vehicle, station details, and booking information in one clear place.',
  previewTo = '/demo',
  previewLabel = 'View demo workspace',
  children,
}: AuthFrameProps) {
  const location = useLocation();
  const mode = location.pathname.startsWith('/register') ? 'register' : 'login';

  return (
    <div key={location.pathname} className={`auth-page auth-refined auth-page--${mode}`}>
      <aside className="auth-story" aria-label="GreenCharge introduction">
        <span className="auth-orbit auth-orbit-one" aria-hidden="true" />
        <span className="auth-orbit auth-orbit-two" aria-hidden="true" />
        <div className="auth-story-content">
          <Link to="/" className="brand auth-brand"><span className="brand-mark"><Zap className="size-4 fill-current" /></span><span>GreenCharge</span><span className="auth-brand-country">Pakistan</span></Link>
          <p className="auth-story-kicker"><ShieldCheck className="size-4" /> Clear charging, every step</p>
          <h1>{storyTitle}</h1>
          <p>{storyCopy}</p>
        </div>
        <div className="auth-story-note"><CircleCheck className="size-5" /> Built for drivers and charging operators across Pakistan.</div>
      </aside>
      <main className="auth-main">
        <div className="auth-card auth-surface">
          <Link to="/" className="auth-back"><ArrowLeft className="size-4" /> Back to GreenCharge</Link>
          <div className="auth-heading-group"><h1 className="auth-heading">{title}</h1><p className="auth-subheading">{description}</p></div>
          {children}
          <div className="auth-bypass" aria-label="Prototype dashboard shortcut">
            <div><span className="auth-bypass-label">Explore first</span><p>View the workspace before creating an account.</p></div>
            <Link to={previewTo} className="auth-bypass-link">{previewLabel}<ArrowUpRight className="size-4" /></Link>
          </div>
        </div>
      </main>
    </div>
  );
}
