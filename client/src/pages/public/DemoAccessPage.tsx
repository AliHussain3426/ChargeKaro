import { ArrowRight, CarFront, ShieldCheck, Store, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import './demo-access.css';

const workspaces = [
  {
    title: 'Driver dashboard',
    description: 'Explore vehicle readiness, nearby stations, and charging-session planning.',
    to: '/customer',
    action: 'Open driver demo',
    icon: CarFront,
  },
  {
    title: 'Supplier dashboard',
    description: 'Review the workspace for station setup, terminals, booking requests, and earnings.',
    to: '/supplier',
    action: 'Open supplier demo',
    icon: Store,
  },
  {
    title: 'Admin dashboard',
    description: 'Preview the platform operations workspace for network-wide oversight.',
    to: '/admin',
    action: 'Open admin demo',
    icon: ShieldCheck,
  },
];

export default function DemoAccessPage() {
  return (
    <section className="demo-access" aria-labelledby="demo-access-title">
      <div className="demo-access__header">
        <span className="demo-access__eyebrow"><Zap className="size-4 fill-current" /> Prototype access</span>
        <h1 id="demo-access-title">Preview a GreenCharge workspace.</h1>
        <p>
          This shortcut is for interface review while authentication is still being connected. It does not create a session or replace role-based access in production.
        </p>
      </div>

      <div className="demo-access__grid">
        {workspaces.map(({ title, description, to, action, icon: Icon }) => (
          <article className="demo-access__card" key={to}>
            <span className="demo-access__icon"><Icon className="size-5" /></span>
            <h2>{title}</h2>
            <p>{description}</p>
            <Link className="demo-access__action" to={to}>{action}<ArrowRight className="size-4" /></Link>
          </article>
        ))}
      </div>

      <p className="demo-access__note">
        Need an account instead? <Link to="/register">Choose a registration path</Link> or <Link to="/login">sign in</Link>.
      </p>
    </section>
  );
}
