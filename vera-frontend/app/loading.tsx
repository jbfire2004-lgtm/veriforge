export default function RootLoading() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3 bg-[#f4f7fa] text-[#4b5563]"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-[#2F8F8C] border-t-transparent"
        aria-hidden
      />
      <p className="text-sm font-medium">Loading VERA…</p>
    </div>
  );
}
