/**
 * Inline script to set `data-theme` before paint (avoids flash).
 * Render in root layout inside <head> or before body content.
 */
export function ThemeScript() {
  const script = `
(function() {
  try {
    var key = 'vera-theme';
    var stored = localStorage.getItem(key);
    var mode = stored === 'dark' || stored === 'light' || stored === 'system' ? stored : 'light';
    var resolved = mode === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode;
    document.documentElement.setAttribute('data-theme', resolved);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;
  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
