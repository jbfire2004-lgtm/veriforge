export default function WelcomeLoading() {
  return (
    <div className="space-y-6 py-4" aria-live="polite" aria-busy="true">
      <div className="h-40 animate-pulse rounded-2xl bg-[#2A2E33]/10" />
      <div className="grid gap-5 md:grid-cols-3">
        <div className="h-52 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-[#e5e7eb]" />
        <div className="h-52 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-[#e5e7eb]" />
        <div className="h-52 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-[#e5e7eb]" />
      </div>
      <p className="text-center text-sm text-[#64748b]">Loading your workspace…</p>
    </div>
  );
}
