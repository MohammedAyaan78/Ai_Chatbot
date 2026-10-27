/**
 * theme.js – Shared Theme Management (Instant Paint, Zero Flash)
 * 
 * Sets the theme immediately on load before DOM render to prevent flashing.
 * Persists theme preference across index.html and chat.html.
 */

const THEME_KEY = 'neuralchat_theme';

/**
 * Get the initial theme from localStorage or system preference.
 */
export function getSavedTheme() {
  if (typeof window !== 'undefined' && window.location) {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlTheme = params.get('theme');
      if (urlTheme === 'dark' || urlTheme === 'light') {
        localStorage.setItem(THEME_KEY, urlTheme);
        return urlTheme;
      }
    } catch (e) {}
  }

  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch (e) {}
  
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}

/**
 * Apply the theme to documentElement and update storage.
 */
export function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {}

  // Update theme toggle buttons if present
  document.querySelectorAll('[data-action="toggle-theme"], #theme-btn').forEach(btn => {
    btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    btn.setAttribute('title', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
  });

  // Notify any theme listeners
  window.dispatchEvent(new CustomEvent('neuralchat:themechange', { detail: { theme } }));
}

/**
 * Toggle between light and dark themes.
 */
export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

/**
 * Bind click events to theme buttons on the current page.
 */
export function initThemeToggle(btnSelector = '#theme-btn') {
  const current = document.documentElement.getAttribute('data-theme') || getSavedTheme();
  applyTheme(current);

  const btns = document.querySelectorAll(btnSelector);
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleTheme();
    });
  });
}

// ── INSTANT EXECUTION (Run immediately upon script import/evaluation) ──
if (typeof document !== 'undefined') {
  const initialTheme = getSavedTheme();
  document.documentElement.setAttribute('data-theme', initialTheme);
}
