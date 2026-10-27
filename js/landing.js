/**
 * landing.js – Landing Page Bootstrap (index.html)
 */

import { initThemeToggle } from './theme.js';
import { initHero3D } from './hero3d.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Theme Toggle Button
  initThemeToggle('#theme-btn');

  // 2. Initialize 3D Hero Scene
  try {
    initHero3D();
  } catch (err) {
    console.warn('[Landing] 3D Hero init failed:', err);
  }

  // 3. Scroll Reveal Animations (IntersectionObserver)
  initScrollReveal();

  // 4. Smooth page transition for chat links (failsafe, non-blocking)
  initPageTransitions();
});

function initScrollReveal() {
  if (typeof IntersectionObserver === 'undefined') {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function initPageTransitions() {
  // Listen on any link targeting chat.html
  document.querySelectorAll('a[href^="chat.html"]').forEach(link => {
    link.addEventListener('click', (e) => {
      // Don't intercept if modifier keys or new tab
      if (e.metaKey || e.ctrlKey || e.shiftKey || link.target === '_blank') return;

      const targetUrl = link.getAttribute('href');
      if (!targetUrl) return;

      // Optional short 200ms transition
      e.preventDefault();
      document.body.style.transition = 'opacity 200ms ease';
      document.body.style.opacity = '0';

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 200);
    });
  });
}
