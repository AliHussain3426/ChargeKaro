import type { ReactNode } from 'react';
import { ArrowLeft, CircleCheck, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogo from '@/components/ui/BrandLogo';
import './auth.css';

interface AuthFrameProps {
  title: string;
  description: string;
  storyTitle?: string;
  storyCopy?: string;
  children: ReactNode;
}

export default function AuthFrame({
  title,
  description,
  storyTitle = 'Make every charging stop easier to plan.',
  storyCopy = 'Keep your vehicle, station details, and booking information in one clear place.',
  children,
}: AuthFrameProps) {
  const location = useLocation();
  const mode = location.pathname.startsWith('/register') ? 'register' : 'login';

  return (
    <div key={location.pathname} className={`auth-page auth-refined auth-page--${mode}`}>
      <aside className="auth-story" aria-label="ChargeKaro introduction">
        <span className="auth-orbit auth-orbit-one" aria-hidden="true" />
        <span className="auth-orbit auth-orbit-two" aria-hidden="true" />
        <div className="auth-story-content">
          <Link to="/" className="brand auth-brand"><BrandLogo /><span>ChargeKaro</span><span className="auth-brand-country">Pakistan</span></Link>
          <p className="auth-story-kicker"><ShieldCheck className="size-4" /> Clear charging, every step</p>
          <h1>{storyTitle}</h1>
          <p>{storyCopy}</p>
        </div>
        <div className="auth-story-note"><CircleCheck className="size-5" /> Built for drivers and charging operators across Pakistan.</div>
      </aside>
      <main className="auth-main">
        <div className="auth-card auth-surface">
          <Link to="/" className="auth-back"><ArrowLeft className="size-4" /> Back to ChargeKaro</Link>
          <div className="auth-heading-group"><h1 className="auth-heading">{title}</h1><p className="auth-subheading">{description}</p></div>
          {children}
        </div>
      </main>
    </div>
  );
}
