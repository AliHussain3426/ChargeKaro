import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, CalendarDays, Check, ChevronRight, CircleCheck, CircleDollarSign, Copy, Headphones, Mail, MapPin, Navigation, PlugZap, Route, Settings2, ShieldCheck, Store, Zap } from 'lucide-react';

/**
 * Software landing plan: product-led route planner hero, quiet route-flow motion,
 * then distinct driver, operator, and support workspaces. One green accent and the
 * app's own interface carry the visual story rather than decorative stock imagery.
 */
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
              <Link to="/#for-suppliers" className="lp-text-action">List a station <ChevronRight className="size-4" /></Link>
            </div>
            <div className="lp-hero-proof" aria-label="GreenCharge benefits">
              <span><Check className="size-4" /> Compatible connectors</span>
              <span><Check className="size-4" /> Clear booking status</span>
            </div>
          </div>

          <div className="lp-route-stage" role="img" aria-label="A route planner showing nearby compatible charging stations in Gulberg, Lahore">
            <div className="lp-stage-glow" />
            <div className="lp-map-grid" />
            <svg className="lp-route-svg" viewBox="0 0 760 600" fill="none" aria-hidden="true">
              <path className="lp-road lp-road--one" d="M-40 518C118 469 186 409 239 309C305 182 381 200 446 283C512 368 615 337 805 155" />
              <path className="lp-road lp-road--two" d="M-30 132C129 195 187 144 291 92C405 34 479 113 517 201C577 340 672 383 800 354" />
              <path className="lp-route-line" d="M86 477C169 453 211 396 245 315C279 235 361 228 420 284C486 349 531 337 622 261" />
            </svg>
            <span className="lp-map-label lp-map-label--north">Gulberg</span>
            <span className="lp-map-label lp-map-label--south">Lahore</span>
            <span className="lp-route-origin"><Navigation className="size-4 fill-current" /></span>
            <span className="lp-route-station lp-route-station--one"><Zap className="size-4 fill-current" /></span>
            <span className="lp-route-station lp-route-station--two"><Zap className="size-3 fill-current" /></span>
            <article className="lp-route-card">
              <div className="lp-route-card-top"><span className="lp-live-dot" /> <span>Closest compatible stop</span><b>1.8 km</b></div>
              <div className="lp-route-card-station"><span className="lp-station-icon"><PlugZap className="size-4" /></span><div><strong>Gulberg Charge Hub</strong><small>CCS2 · 45 kW · 2 ports open</small></div></div>
              <div className="lp-route-card-foot"><span>Arrival estimate</span><strong>7 min</strong><span className="lp-card-ready"><CircleCheck className="size-3" /> Ready</span></div>
            </article>
            <div className="lp-route-chip"><Route className="size-4" /><span>Route checked</span></div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="lp-flow" aria-labelledby="flow-title">
        <div className="gc-container">
          <div className="lp-section-head lp-section-head--light">
            <div><p className="lp-eyebrow">From search to charge</p><h2 id="flow-title">A clearer route to a ready port.</h2></div>
            <p>GreenCharge keeps the small decisions in one flow, so drivers can act on the information that matters.</p>
          </div>
          <ol className="lp-flow-list">
            <li><span className="lp-flow-number">01</span><div className="lp-flow-icon"><Navigation className="size-5" /></div><div><h3>Choose a location</h3><p>Start with your current area or enter where the next charge should happen.</p></div><span className="lp-flow-tail" /></li>
            <li><span className="lp-flow-number">02</span><div className="lp-flow-icon"><PlugZap className="size-5" /></div><div><h3>Match a station</h3><p>Compare compatible connectors, power, distance, and available ports in one view.</p></div><span className="lp-flow-tail" /></li>
            <li><span className="lp-flow-number">03</span><div className="lp-flow-icon"><CalendarDays className="size-5" /></div><div><h3>Request your time</h3><p>Choose a suitable slot and follow the response from your driver workspace.</p></div></li>
          </ol>
        </div>
      </section>

      <section id="for-customers" className="lp-driver" aria-labelledby="driver-title">
        <div className="gc-container">
          <div className="lp-section-head">
            <div><p className="lp-eyebrow">For EV drivers</p><h2 id="driver-title">Your next charging stop, already thought through.</h2></div>
            <p>Search first. Then choose with confidence—not after arriving at a busy or incompatible port.</p>
          </div>
          <div className="lp-driver-console">
            <article className="lp-driver-vehicle">
              <div className="lp-mini-head"><span>Selected vehicle</span><span className="lp-status-line"><i /> Compatible search</span></div>
              <div className="lp-vehicle-profile"><span className="lp-vehicle-mark"><Zap className="size-6 fill-current" /></span><div><strong>Nissan Leaf</strong><small>Type 2 · 40 kWh battery</small></div></div>
              <div className="lp-battery"><div><span>Charge now</span><b>62%</b></div><div className="lp-battery-meter"><i /></div><small>Estimated 146 km remaining</small></div>
            </article>

            <article className="lp-driver-booking">
              <div className="lp-mini-head"><span>Reserve a charging session</span><span className="lp-booking-power">45 kW</span></div>
              <div className="lp-booking-place"><span className="lp-station-icon"><MapPin className="size-4" /></span><div><strong>Gulberg Charge Hub</strong><small>Main Boulevard · 1.8 km away</small></div><CircleCheck className="size-5" /></div>
              <div className="lp-slot-picker" aria-label="Choose a booking time">
                {['13:00', '14:30', '16:00'].map((slot) => <button key={slot} type="button" onClick={() => setSelectedSlot(slot)} className={selectedSlot === slot ? 'selected' : ''}><small>Today</small><span>{slot}</span></button>)}
              </div>
              <div className="lp-booking-total"><span>Estimated rate <b>PKR 75 / kWh</b></span><Link to="/register/customer">Request this slot <ArrowRight className="size-4" /></Link></div>
            </article>

            <div className="lp-driver-story"><p className="lp-eyebrow">Made for the road ahead</p><h3>Every station detail in its place.</h3><p>Keep your vehicle, nearby compatible chargers, requests, and booking updates connected in one driver workspace.</p><Link to="/register/customer" className="lp-text-action">Create driver account <ArrowRight className="size-4" /></Link></div>
          </div>
        </div>
      </section>

      <section id="for-suppliers" className="lp-operator" aria-labelledby="operator-title">
        <div className="gc-container lp-operator-grid">
          <div className="lp-operator-copy"><p className="lp-eyebrow">For station operators</p><h2 id="operator-title">Give every available port a better chance to be chosen.</h2><p>Share the details drivers need, then manage requests, charging terminals, and the work around your stations from one place.</p><div className="lp-hero-actions"><Link to="/register/supplier" className="gc-button lp-button-light">List a station <ArrowRight className="size-4" /></Link><Link to="/demo" className="lp-text-action lp-text-action--light">Preview workspace <ChevronRight className="size-4" /></Link></div></div>
          <div className="lp-operator-window" data-ui>
            <div className="lp-operator-window-head"><div><span>Gulberg Charge Hub</span><small>Station workspace</small></div><span className="lp-window-live"><i /> Available now</span></div>
            <div className="lp-operator-map"><span className="lp-map-route-dash" /><span className="lp-operator-pin"><Store className="size-4" /></span><span className="lp-operator-map-tag">4 terminals</span></div>
            <div className="lp-operator-items">
              <div><span className="lp-operator-row-icon"><PlugZap className="size-4" /></span><p><b>Terminal availability</b><small>2 of 4 ports ready for drivers</small></p><strong>Manage <ChevronRight className="size-4" /></strong></div>
              <div><span className="lp-operator-row-icon"><Settings2 className="size-4" /></span><p><b>Booking requests</b><small>Review incoming session requests</small></p><strong>Review <ChevronRight className="size-4" /></strong></div>
              <div><span className="lp-operator-row-icon"><CircleDollarSign className="size-4" /></span><p><b>Session earnings</b><small>See completed charging sessions</small></p><strong>View <ChevronRight className="size-4" /></strong></div>
            </div>
          </div>
        </div>
      </section>

      <section id="about-help" className="lp-help" aria-labelledby="help-title">
        <div className="gc-container lp-help-grid">
          <div><p className="lp-eyebrow">About GreenCharge</p><h2 id="help-title">One charging network, built around clearer choices.</h2><p>GreenCharge is being built for Pakistan&apos;s EV drivers and charging operators—bringing station details, booking decisions, and daily operational tools together.</p><div className="lp-principles"><span><ShieldCheck className="size-4" /> Decisions stay clear</span><span><Route className="size-4" /> Routes stay practical</span></div></div>
          <aside className="lp-support-card" aria-labelledby="support-title"><span className="lp-support-icon"><Headphones className="size-5" /></span><p className="lp-eyebrow">Need help?</p><h3 id="support-title">Talk to GreenCharge support.</h3><p>For account, access, or platform questions, our support team is here to help.</p><div className="lp-support-actions"><button type="button" onClick={copySupportEmail} className="lp-support-copy">Copy support email <Copy className="size-4" /></button><a href="mailto:support@greencharge.pk?subject=GreenCharge%20support">Open email app <Mail className="size-4" /></a></div><p className="lp-support-status" role="status" aria-live="polite">{supportMessage}</p></aside>
        </div>
      </section>

      <section className="lp-close" aria-labelledby="close-title"><div className="gc-container lp-close-inner"><div><p className="lp-eyebrow">Start with your next charge</p><h2 id="close-title">A more certain charging stop starts here.</h2></div><div><p>Choose the account that fits your role. Add your vehicle or station details when you are ready.</p><Link to="/register" className="gc-button gc-button-primary">Create an account <ArrowRight className="size-4" /></Link></div></div></section>
    </div>
  );
}
