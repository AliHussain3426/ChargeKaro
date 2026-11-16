import { ArrowRight, CalendarClock, CarFront, CircleCheck, MapPin, PlugZap, Route } from 'lucide-react';
import { Link } from 'react-router-dom';
import './public-pages.css';

const journey = [
  {
    title: 'Start with your vehicle.',
    copy: 'Add the vehicle you drive once. ChargeKaro uses its connector and charging details to make the station list useful from the beginning.',
    responseTitle: 'Nissan Leaf · Type 2',
    response: 'Compatible charger types are ready to filter.',
  },
  {
    title: 'Choose a station with a real opening.',
    copy: 'Compare location, charging power, connector type, availability, and station details before choosing the stop that fits your route.',
    responseTitle: 'Gulberg Charge Hub · 45 kW',
    response: '2 compatible ports are currently available.',
  },
  {
    title: 'Request a time that works.',
    copy: 'Select a compatible terminal and send a booking request. You will see the outcome clearly instead of guessing whether the slot is held.',
    responseTitle: 'Booking request: pending review',
    response: 'The supplier is notified and your dashboard follows the status.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="product-page">
      <section className="product-hero">
        <div className="gc-container product-hero-grid">
          <div>
            <p className="product-kicker"><Route className="size-4" /> A clearer charging journey</p>
            <h1>Know the stop before you make it.</h1>
            <p className="product-hero-copy">ChargeKaro turns a charging stop into a small set of useful decisions: choose the right station, request a compatible terminal, and follow the outcome in one place.</p>
            <div className="product-hero-actions"><Link to="/register/customer" className="gc-button gc-button-primary">Create a driver account <ArrowRight className="size-4" /></Link><Link to="/demo" className="gc-button gc-button-secondary">Preview the app</Link></div>
          </div>
          <div className="product-stage">
            <div className="ui-paper" data-ui>
              <p className="ui-eyebrow">Plan a charging stop</p><h2 className="ui-title">Your route, made usable</h2>
              <div className="ui-list"><div className="ui-list-row"><span className="ui-round-icon"><CarFront className="size-4" /></span><div><b>Nissan Leaf</b><small>Type 2 · 40 kWh battery</small></div><span>Ready</span></div><div className="ui-list-row"><span className="ui-round-icon"><MapPin className="size-4" /></span><div><b>Gulberg Charge Hub</b><small>1.8 km · 45 kW fast charge</small></div><span>2 open</span></div><div className="ui-list-row"><span className="ui-round-icon"><CalendarClock className="size-4" /></span><div><b>Select a time</b><small>Today after 14:30</small></div><span>Next</span></div></div>
              <div className="ui-summary"><span><b>One clear flow</b><br />Vehicle → station → request</span><CircleCheck className="size-5 text-primary" /></div>
            </div>
            <span className="product-stage__note">Search, compare, request.</span>
          </div>
        </div>
      </section>

      <section className="product-story product-story--night">
        <div className="gc-container">
          <header className="story-heading"><div><p className="product-kicker">The driver flow</p><h2>Three decisions. No unnecessary noise.</h2></div><p>Each screen is designed to answer the next practical question, without requiring a driver to jump between a map, a message thread, and a spreadsheet.</p></header>
          <div className="journey-list">{journey.map((item, index) => <article className="journey-row" key={item.title}><div className="journey-index"><span>{index + 1}</span> On the road</div><div className="journey-copy"><h3>{item.title}</h3><p>{item.copy}</p><div className="journey-response" data-ui><strong>{item.responseTitle}</strong><span>{item.response}</span></div></div></article>)}</div>
        </div>
      </section>

      <section className="product-statement gc-container">
        <div><p className="product-kicker"><PlugZap className="size-4" /> Useful when plans change</p><h2>Every booking state stays visible.</h2><p>A request is not automatically a confirmed booking. ChargeKaro deliberately distinguishes a request, supplier response, confirmation, cancellation, and completion.</p></div>
        <div className="signal-board"><div><CalendarClock className="size-5" /><b>Request sent</b><p>The terminal and time are waiting for the supplier response.</p></div><div><CircleCheck className="size-5" /><b>Accepted</b><p>Your next step becomes clear when the station accepts the request.</p></div><div><MapPin className="size-5" /><b>Confirmed</b><p>Use the station address, terminal details, and booking reference when you travel.</p></div><div><PlugZap className="size-5" /><b>Completed</b><p>Your history shows the finished session and any relevant records.</p></div></div>
      </section>

      <section className="product-callout"><div className="gc-container product-callout-inner"><div><p className="product-kicker !text-[#c7eee4]">Make the next stop easier</p><h2>Start with your vehicle.</h2><p>Once your EV details are in place, the discovery experience can focus on the charging options that make sense for you.</p></div><div className="callout-panel"><p className="ui-eyebrow">Driver account</p><h3 className="ui-title">Set up in a few deliberate steps</h3><p>Create an account now; vehicle registration and live data will follow as the platform API is connected.</p><Link to="/register/customer" className="gc-button gc-button-primary mt-5 w-full">Create driver account <ArrowRight className="size-4" /></Link></div></div></section>
    </div>
  );
}
