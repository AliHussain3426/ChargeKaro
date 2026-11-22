import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Copy,
  Headphones,
  Mail,
  Navigation,
  PlugZap,
  Route,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import LandingChargingAnimation from './LandingChargingAnimation';

export default function LandingPage() {
  const [supportMessage, setSupportMessage] = useState('');
  const location = useLocation();

  async function copySupportEmail() {
    const supportEmail = 'support@chargekaro.pk';
    try {
      await navigator.clipboard.writeText(supportEmail);
      setSupportMessage('Support email copied.');
    } catch {
      setSupportMessage(`Email us at ${supportEmail}.`);
    }
  }

  useEffect(() => {
    const sectionId = location.hash.slice(1);
    const frame = window.requestAnimationFrame(() => {
      if (sectionId) document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.pathname]);

  return (
    <div className="landing landing-v2">
      <section id="home" className="lp-hero" aria-labelledby="landing-title">
        <div className="gc-container lp-hero-grid">
          <div className="lp-hero-copy">
            <p className="lp-eyebrow"><span className="lp-eyebrow-bolt"><Zap className="size-3 fill-current" /></span>Pakistan&apos;s EV charging workspace</p>
            <h1 id="landing-title">EV charging,<br /><em>without guesswork.</em></h1>
            <p className="lp-hero-lead">Find the stations that fit your vehicle, see what is open, and request a time before you leave.</p>
            <div className="lp-hero-actions">
              <Link to="/register/customer" className="gc-button gc-button-primary">Find a charging station <ArrowRight className="size-4" /></Link>
              <Link to="/register/supplier" className="lp-text-action">List a station <ChevronRight className="size-4" /></Link>
            </div>
            <div className="lp-hero-proof" aria-label="ChargeKaro benefits">
              <span><Check className="size-4" /> Compatible connectors</span>
              <span><Check className="size-4" /> Clear booking status</span>
            </div>
          </div>

          <div className="lp-route-stage lp-route-stage--live lp-charge-stage">
            <LandingChargingAnimation />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="lp-flow" aria-labelledby="flow-title">
        <div className="gc-container">
          <div className="lp-section-head lp-section-head--light">
            <div><p className="lp-eyebrow">From search to charge</p><h2 id="flow-title">A clearer route to a ready port.</h2></div>
            <p>ChargeKaro keeps the small decisions in one flow, so you can act on the information that matters.</p>
          </div>
          <ol className="lp-flow-list">
            <li><span className="lp-flow-number">01</span><div className="lp-flow-icon"><Navigation className="size-5" /></div><div><h3>Choose a location</h3><p>Start with your current area or enter where the next charge should happen.</p></div><span className="lp-flow-tail" /></li>
            <li><span className="lp-flow-number">02</span><div className="lp-flow-icon"><PlugZap className="size-5" /></div><div><h3>Match a station</h3><p>Compare compatible connectors, power, distance, and available ports in one view.</p></div><span className="lp-flow-tail" /></li>
            <li><span className="lp-flow-number">03</span><div className="lp-flow-icon"><CalendarDays className="size-5" /></div><div><h3>Request your time</h3><p>Choose a suitable slot and follow the response in your workspace.</p></div></li>
          </ol>
        </div>
      </section>

      <section id="about-help" className="lp-help" aria-labelledby="help-title">
        <div className="gc-container lp-help-grid">
          <div><p className="lp-eyebrow">About ChargeKaro</p><h2 id="help-title">One charging network, built around clearer choices.</h2><p>ChargeKaro is being built for Pakistan&apos;s EV drivers and charging operators—bringing station details, booking decisions, and daily operational tools together.</p><div className="lp-principles"><span><ShieldCheck className="size-4" /> Decisions stay clear</span><span><Route className="size-4" /> Routes stay practical</span></div></div>
          <aside className="lp-support-card" aria-labelledby="support-title"><span className="lp-support-icon"><Headphones className="size-5" /></span><p className="lp-eyebrow">Need help?</p><h3 id="support-title">Talk to ChargeKaro support.</h3><p>For account, access, or platform questions, our support team is here to help.</p><div className="lp-support-actions"><button type="button" onClick={copySupportEmail} className="lp-support-copy">Copy support email <Copy className="size-4" /></button><a href="mailto:support@chargekaro.pk?subject=ChargeKaro%20support">Open email app <Mail className="size-4" /></a></div><p className="lp-support-status" role="status" aria-live="polite">{supportMessage}</p></aside>
        </div>
      </section>

      <section className="lp-close" aria-labelledby="close-title"><div className="gc-container lp-close-inner"><div><p className="lp-eyebrow">Start with your next charge</p><h2 id="close-title">A more certain charging stop starts here.</h2></div><div><p>Choose the account that fits your role. Add your vehicle or station details when you are ready.</p><Link to="/register" className="gc-button gc-button-primary">Create an account <ArrowRight className="size-4" /></Link></div></div></section>
    </div>
  );
}