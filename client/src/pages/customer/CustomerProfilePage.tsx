import { User, Mail, Phone, Lock } from 'lucide-react';

export default function CustomerProfilePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Profile & Settings</h1>
        <p className="mt-1 text-sm text-foreground-secondary">Manage your account information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="rounded-[12px] bg-surface border border-border-light p-6">
          <div className="flex flex-col items-center text-center">
            <div className="size-20 rounded-full bg-primary-light flex items-center justify-center">
              <User className="size-8 text-primary" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">User Name</h3>
            <p className="text-sm text-foreground-muted">customer@example.com</p>
            <span className="mt-2 rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary">
              Customer
            </span>
          </div>
        </div>

        {/* Settings form */}
        <div className="lg:col-span-2 rounded-[12px] bg-surface border border-border-light p-6">
          <h2 className="text-base font-semibold text-foreground mb-5">Account Information</h2>
          <form className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground-muted" />
                  <input type="text" defaultValue="User Name" className="w-full rounded-[8px] border border-border bg-background pl-10 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground-muted" />
                  <input type="tel" defaultValue="+92 300 1234567" className="w-full rounded-[8px] border border-border bg-background pl-10 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground-muted" />
                <input type="email" defaultValue="customer@example.com" className="w-full rounded-[8px] border border-border bg-background pl-10 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="rounded-[10px] bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

