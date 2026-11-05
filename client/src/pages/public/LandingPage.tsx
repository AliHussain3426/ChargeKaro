import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, CalendarDays, Check, CircleCheck, CircleDollarSign, Copy, Headphones, Mail, MapPin, Navigation, PlugZap, Route, Settings2, Store, Zap } from 'lucide-react';

export default function LandingPage() {
  const [selectedSlot, setSelectedSlot] = useState('14:30');
  const [supportMessage, setSupportMessage] = useState('');
  const location = useLocation();

  async function copySupportEmail() {
    const supportEmail = 'support@greencharge.pk';

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
      if (sectionId) {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.pathname]);

  return (
    <div className="landing">
      <section id="home" className="landing-hero">
        <div className="gc-container landing-hero-grid">
          <div>
            <h1 className="landing-title">Charge ahead.<br />Without the wait.</h1>
            <p className="landing-summary">GreenCharge helps EV drivers find compatible stations, reserve a charging slot, and arrive knowing exactly what is available.</p>
            <div className="landing-actions">
              <Link to="/register/customer" className="gc-button gc-button-primary">Find a charging station <ArrowRight className="size-4" /></Link>
              <Link to="/#for-suppliers" className="gc-button gc-button-secondary">Add your station</Link>
            </div>
            <div className="hero-note"><span><Check className="size-4" /> Live availability</span><span><Check className="size-4" /> Compatible connectors</span></div>
          </div>
          <div className="charging-stage">
            <span className="route-line" />
            <div className="finder-fragment" data-ui>
              <div className="fragment-row"><div><p className="fragment-label">Available near you</p><p className="fragment-title">Find a fast charger</p></div><span className="mini-marker"><MapPin className="size-4" /></span></div>
              <div className="fragment-search"><Navigation className="size-4" /> Gulberg, Lahore <span className="ml-auto font-semibold text-[#0b7d68]">Use location</span></div>
              <div className="mt-2">
                <div className="station-mini"><span className="mini-marker"><PlugZap className="size-4" /></span><div><p className="station-mini-name">Gulberg Charge Hub</p><p className="station-mini-meta">45 kW · 2 ports available</p></div><span className="station-mini-km">1.8 km</span></div>
                <div className="station-mini"><span className="mini-marker"><PlugZap className="size-4" /></span><div><p className="station-mini-name">DHA Phase 5 EV Stop</p><p className="station-mini-meta">22 kW · 1 port available</p></div><span className="station-mini-km">4.2 km</span></div>
              </div>
            </div>
            <div className="hero-pulse"><Zap className="size-5 text-[#9fd6c7]" /><div><strong>45 kW available</strong><span>Ready when you are</span></div></div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="intro-strip">
        <div className="gc-container intro-grid">
          <div><span className="section-kicker">Designed around the drive</span><h2 className="section-title mt-4">The road gets simpler from here.</h2></div>
          <div><p className="intro-copy">From the first search to the moment you plug in, GreenCharge keeps the information that matters close to hand.</p><div className="benefit-list">
            <article className="benefit-item"><Route className="size-5" /><div><h3>Find the right stop</h3><p>Compare location, charging speed, connector type, pricing, and live terminal status before you set out.</p></div></article>
            <article className="benefit-item"><CalendarDays className="size-5" /><div><h3>Reserve your time</h3><p>Choose a compatible port and request your charging session in a few clear steps.</p></div></article>
            <article className="benefit-item"><CircleCheck className="size-5" /><div><h3>Arrive prepared</h3><p>Keep booking decisions, status updates, and every vehicle in one calm, useful place.</p></div></article>
          </div></div>
        </div>
      </section>

      <section id="for-customers" className="landing-proof">
        <div className="gc-container proof-grid">
          <div className="proof-copy"><span className="section-kicker">One deliberate next step</span><h2 className="section-title mt-4">Make a charging stop a sure thing.</h2><p>Search the stations that fit your vehicle, select a time that works, and receive a clear status before you travel.</p><div className="steps"><div className="step"><b>1</b> Choose your compatible station</div><div className="step"><b>2</b> Select a time and request a slot</div><div className="step"><b>3</b> Track the response in your dashboard</div></div></div>
          <div className="booking-fragment" data-ui><div className="booking-top"><div><p className="fragment-label">Reserve a charging session</p><h3>Gulberg Charge Hub</h3><p className="fragment-label mt-2">CCS2 · 45 kW · Main Boulevard</p></div><span className="booking-badge">2 ports open</span></div><div className="booking-slots">{['13:00','14:30','16:00'].map((slot) => <button key={slot} type="button" onClick={() => setSelectedSlot(slot)} className={`booking-slot ${selectedSlot === slot ? 'selected' : ''}`}><span className="block text-[.67rem] font-medium opacity-75">Today</span>{slot}</button>)}</div><div className="booking-bottom"><p className="booking-price">PKR 75 <span>estimated charging rate / kWh</span></p><Link to="/register/customer" className="gc-button gc-button-primary">Request this slot <ArrowRight className="size-4" /></Link></div></div>
        </div>
      </section>

      <section id="for-suppliers" className="landing-supplier">
        <div className="gc-container supplier-grid">
          <div className="supplier-copy">
            <span className="section-kicker">For charging operators</span>
            <h2 className="section-title mt-4">Make every port easier to choose.</h2>
            <p>Give drivers the practical details they need while keeping station setup, terminal availability, requests, and earnings together for your team.</p>
            <div className="landing-actions">
              <Link to="/register/supplier" className="gc-button gc-button-primary">List your station <ArrowRight className="size-4" /></Link>
              <Link to="/demo" className="gc-button gc-button-secondary">Preview supplier workspace</Link>
            </div>
          </div>
          <div className="supplier-fragment" data-ui>
            <div className="fragment-row"><div><p className="fragment-label">Station workspace</p><p className="fragment-title">Gulberg Charge Hub</p></div><span className="mini-marker"><Store className="size-4" /></span></div>
            <div className="supplier-fragment-row"><span><PlugZap className="size-4" /></span><div><b>Terminals</b><small>4 charging points · 2 available</small></div><strong>Manage</strong></div>
            <div className="supplier-fragment-row"><span><Settings2 className="size-4" /></span><div><b>Booking requests</b><small>3 requests waiting for review</small></div><strong>Review</strong></div>
            <div className="supplier-fragment-row"><span><CircleDollarSign className="size-4" /></span><div><b>Session earnings</b><small>Clear records after completed sessions</small></div><strong>View</strong></div>
          </div>
        </div>
      </section>

      <section id="about-help" className="landing-help">
        <div className="gc-container help-grid">
          <div className="help-copy">
            <span className="section-kicker">About GreenCharge</span>
            <h2 className="section-title mt-4">EV charging information that is easier to act on.</h2>
            <p>GreenCharge is being built for drivers and charging operators in Pakistan who need station details, booking decisions, and account tools in one place.</p>
          </div>
          <aside className="help-panel" aria-labelledby="help-title">
            <span className="help-panel-icon"><Headphones className="size-5" /></span>
            <p className="fragment-label">Need help?</p>
            <h3 id="help-title">Contact GreenCharge support.</h3>
            <p>For account or platform questions, contact the GreenCharge support team.</p>
            <div className="help-actions"><button type="button" onClick={copySupportEmail} className="gc-button gc-button-secondary">Copy support email <Copy className="size-4" /></button><a href="mailto:support@greencharge.pk?subject=GreenCharge%20support" className="help-email-link">Open email app <Mail className="size-4" /></a></div>
            <p className="help-status" role="status" aria-live="polite">{supportMessage}</p>
          </aside>
        </div>
      </section>

      <section className="landing-cta"><div className="gc-container landing-cta-box"><div><span className="section-kicker !text-[#c7eee4]">Start where you are</span><h2 className="section-title mt-4">A clearer charge is one account away.</h2><p>Create a driver account to plan your next stop, or join as a supplier to make your charging points discoverable.</p></div><div className="cta-choice"><p className="fragment-label">Choose your path</p><h3 className="font-bold text-xl">Ready to get started?</h3><p>It takes a moment to set up your account. You can add vehicle or station details afterward.</p><Link to="/register" className="gc-button gc-button-primary w-full">Create an account <ArrowRight className="size-4" /></Link></div></div></section>
    </div>
  );
}

