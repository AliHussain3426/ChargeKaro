import { ArrowRight, CarFront, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthFrame from '@/components/auth/AuthFrame';

export default function RegisterSelectPage() {
  return (
    <AuthFrame title="Choose your account type." description="Choose the workspace that matches how you use GreenCharge." storyTitle="Charging works better when everyone has the right information." storyCopy="Choose a driver or supplier account to get started with the tools that fit your work." previewTo="/demo" previewLabel="View demo workspace">
      <div className="role-choice-grid">
        <Link to="/register/customer" className="role-choice"><span className="role-choice-icon"><CarFront className="size-5" /></span><span><h2>Driver account</h2><p>Find stations, save vehicles, and request charging sessions.</p></span><ArrowRight className="ml-auto size-4 text-[#0b7d68]" /></Link>
        <Link to="/register/supplier" className="role-choice"><span className="role-choice-icon"><Store className="size-5" /></span><span><h2>Supplier account</h2><p>Manage stations, terminals, booking requests, and earnings.</p></span><ArrowRight className="ml-auto size-4 text-[#0b7d68]" /></Link>
      </div>
      <p className="auth-footer">Already have an account? <Link className="gc-link" to="/login">Sign in</Link></p>
    </AuthFrame>
  );
}
