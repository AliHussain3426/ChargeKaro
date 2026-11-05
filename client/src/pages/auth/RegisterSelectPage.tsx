import { ArrowRight, CarFront, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthFrame from '@/components/auth/AuthFrame';

export default function RegisterSelectPage() {
  return (
    <AuthFrame title="Choose your account." description="GreenCharge adapts to what you need to do. Select the path that matches your role." storyTitle="A charging network works better when everyone is connected." storyCopy="Whether you need a reliable stop or operate the infrastructure behind one, your workspace begins here." previewTo="/demo" previewLabel="Open demo dashboard">
      <div className="role-choice-grid">
        <Link to="/register/customer" className="role-choice"><span className="role-choice-icon"><CarFront className="size-5" /></span><span><h2>I drive an EV</h2><p>Find stations, manage vehicles, and request charging sessions.</p></span><ArrowRight className="ml-auto size-4 text-[#0b7d68]" /></Link>
        <Link to="/register/supplier" className="role-choice"><span className="role-choice-icon"><Store className="size-5" /></span><span><h2>I run charging stations</h2><p>Manage stations, terminals, requests, and earnings.</p></span><ArrowRight className="ml-auto size-4 text-[#0b7d68]" /></Link>
      </div>
      <p className="auth-footer">Already have an account? <Link className="gc-link" to="/login">Sign in</Link></p>
    </AuthFrame>
  );
}
