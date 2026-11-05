export default function SystemSettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
        <p className="mt-1 text-sm text-foreground-secondary">Configure platform-wide settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General settings */}
        <div className="rounded-[12px] bg-surface border border-border-light p-6">
          <h2 className="text-base font-semibold text-foreground mb-5">General</h2>
          <form className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Platform Name</label>
              <input type="text" defaultValue="GreenCharge Pakistan" className="w-full rounded-[8px] border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Support Email</label>
              <input type="email" defaultValue="support@greencharge.pk" className="w-full rounded-[8px] border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Default Currency</label>
              <input type="text" defaultValue="PKR" disabled className="w-full rounded-[8px] border border-border bg-surface-elevated px-3 py-2.5 text-sm text-foreground-muted" />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="rounded-[10px] bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors">
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Booking settings */}
        <div className="rounded-[12px] bg-surface border border-border-light p-6">
          <h2 className="text-base font-semibold text-foreground mb-5">Booking Settings</h2>
          <form className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Max Advance Booking (days)</label>
              <input type="number" defaultValue="7" className="w-full rounded-[8px] border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Cancellation Window (hours)</label>
              <input type="number" defaultValue="2" className="w-full rounded-[8px] border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Platform Commission (%)</label>
              <input type="number" defaultValue="10" className="w-full rounded-[8px] border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent" />
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
