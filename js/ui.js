/**
 * ui.js – NeuralChat Chat UI Renderer & Interactive Components
 * 
 * Handles:
 *   - XSS-safe Markdown rendering (bot replies) & escaped user input
 *   - Tight list spacing & block formatting
 *   - Typewriter animation with prefers-reduced-motion bypass
 *   - Typing indicator (three-dots bounce)
 *   - Suggestion chips rendering
 *   - LocalStorage conversation persistence
 *   - Speech synthesis (TTS) & Web Speech API Voice input
 *   - Auto-growing textarea & character count
 *   - Copy button & scroll-to-latest button
 *   - Thinking orb avatar pulse
 */

const $ = (id) => document.getElementById(id);

// ─────────────────────────────────────────────────────────────
// XSS-SAFE MARKDOWN-LITE RENDERER
// ─────────────────────────────────────────────────────────────

export function escapeHTML(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Render Markdown-lite for bot messages only.
 * User inputs are ALWAYS strictly text-escaped.
 */
export function renderMarkdown(text) {
  // Normalize and collapse repeated blank lines
  let html = escapeHTML(text).replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');

  // Code blocks (```lang\n...\n```)
  html = html.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) => {
    const langAttr = lang ? ` class="lang-${escapeHTML(lang)}"` : '';
    return `<pre><code${langAttr}>${code.trim()}</code></pre>`;
  });

  // Inline code (`...`)
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

  // Bold (**...**)
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');

  // Italic (*...*)
  html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

  // Unordered list items (- or * or •)
  html = html.replace(/^[\s]*[-*•]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // Ordered list items (1. ...)
  html = html.replace(/^[\s]*\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Paragraphs (double newline) and linebreaks (single newline)
  html = html.replace(/\n\n+/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');

  return `<p>${html}</p>`;
}

// ─────────────────────────────────────────────────────────────
// TYPING INDICATOR
// ─────────────────────────────────────────────────────────────

let typingEl = null;

export function showTypingIndicator() {
  const container = $('chat-messages');
  if (!container) return;

  hideTypingIndicator();

  // Set header avatar thinking animation
  const orb = $('header-avatar');
  if (orb) orb.classList.add('is-thinking');

  typingEl = document.createElement('div');
  typingEl.className = 'typing-indicator';
  typingEl.setAttribute('role', 'status');
  typingEl.setAttribute('aria-label', 'NeuralChat is typing a reply');
  typingEl.innerHTML = `
    <div class="message__avatar" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
      </svg>
    </div>
    <div class="typing-bubble">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
  `;

  container.appendChild(typingEl);
  scrollToBottom(container);
  return typingEl;
}

export function hideTypingIndicator() {
  if (typingEl) {
    typingEl.remove();
    typingEl = null;
  }
  const orb = $('header-avatar');
  if (orb) orb.classList.remove('is-thinking');
}

// ─────────────────────────────────────────────────────────────
// TYPEWRITER EFFECT
// ─────────────────────────────────────────────────────────────

const prefersReducedMotion = typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function typewriterReveal(bubbleEl, htmlContent, onDone) {
  if (prefersReducedMotion) {
    bubbleEl.innerHTML = htmlContent;
    onDone?.();
    return;
  }

  const plainText = htmlContent.replace(/<[^>]+>/g, '');
  bubbleEl.innerHTML = '';

  let charIdx = 0;
  const speed = Math.max(10, Math.min(25, 800 / Math.max(plainText.length, 1)));

  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  bubbleEl.appendChild(cursor);

  const timer = setInterval(() => {
    charIdx += Math.ceil(plainText.length / 60);
    charIdx = Math.min(charIdx, plainText.length);

    bubbleEl.innerHTML = escapeHTML(plainText.slice(0, charIdx));
    bubbleEl.appendChild(cursor);

    if (charIdx >= plainText.length) {
      clearInterval(timer);
      setTimeout(() => {
        bubbleEl.innerHTML = htmlContent;
        onDone?.();
      }, 50);
    }

    const container = bubbleEl.closest('.chat-messages');
    if (container) scrollToBottom(container);
  }, speed);
}

// ─────────────────────────────────────────────────────────────
// MESSAGE RENDERING
// ─────────────────────────────────────────────────────────────

let messageIdCounter = 0;

export function addMessage(sender, text, opts = {}) {
  const container = $('chat-messages');
  if (!container) return null;

  // Remove welcome card if present
  const welcomeCard = container.querySelector('.welcome-card');
  if (welcomeCard) welcomeCard.remove();

  const id = `msg-${++messageIdCounter}`;
  const msgEl = document.createElement('div');
  msgEl.className = `message message--${sender}`;
  msgEl.id = id;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const avatarInner = sender === 'bot'
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2zM7.5 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
       </svg>`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
       </svg>`;

  const copyBtn = sender === 'bot'
    ? `<button class="copy-btn" title="Copy reply" aria-label="Copy message text">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      </button>`
    : '';

  const bubbleContent = sender === 'bot'
    ? renderMarkdown(text)
    : `<p>${escapeHTML(text)}</p>`;

  msgEl.innerHTML = `
    <div class="message__avatar" aria-hidden="true">${avatarInner}</div>
    <div class="message__content">
      <div class="message__bubble" role="text">${sender === 'bot' && opts.animate !== false ? '' : bubbleContent}</div>
      <div class="message__meta">
        <time datetime="${now.toISOString()}">${timeStr}</time>
        ${copyBtn}
      </div>
    </div>
  `;

  container.appendChild(msgEl);

  // Typewriter animation for bot
  if (sender === 'bot' && opts.animate !== false) {
    const bubble = msgEl.querySelector('.message__bubble');
    typewriterReveal(bubble, bubbleContent, () => {
      if (opts.tts) speak(text);
      persistMessages();
    });
  }

  // Copy handler
  if (sender === 'bot') {
    const btn = msgEl.querySelector('.copy-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const plain = msgEl.querySelector('.message__bubble')?.textContent || text;
        navigator.clipboard?.writeText(plain).then(() => {
          btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
          setTimeout(() => {
            btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
          }, 1500);
        });
      });
    }
  }

  scrollToBottom(container);
  if (sender === 'user') persistMessages();

  return msgEl;
}

// ─────────────────────────────────────────────────────────────
// CHIPS
// ─────────────────────────────────────────────────────────────

export function renderChips(suggestions, onChipClick) {
  const container = $('chips-container');
  if (!container) return;
  container.innerHTML = '';

  if (!suggestions || suggestions.length === 0) return;

  suggestions.forEach(text => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = text;
    chip.setAttribute('type', 'button');
    chip.setAttribute('aria-label', `Ask: ${text}`);
    chip.addEventListener('click', () => onChipClick(text));
    container.appendChild(chip);
  });
}

export function clearChips() {
  const container = $('chips-container');
  if (container) container.innerHTML = '';
}

// ─────────────────────────────────────────────────────────────
// NLP INSIGHTS PANEL
// ─────────────────────────────────────────────────────────────

export function updateInsights({ intent, confidence, tokens, method }) {
  const intentEl = $('insight-intent');
  if (intentEl) intentEl.textContent = intent || '—';

  const confEl = $('insight-confidence');
  if (confEl) {
    const pct = Math.round((confidence || 0) * 100);
    confEl.textContent = `${pct}%`;
  }

  const tokEl = $('insight-tokens');
  if (tokEl) tokEl.textContent = tokens || '—';

  const methEl = $('insight-method');
  if (methEl) methEl.textContent = method || '—';
}

export function toggleInsightsPanel() {
  const panel = $('insights-panel');
  const btn = $('insights-btn');
  if (!panel) return;

  const isHidden = panel.classList.toggle('is-hidden');
  if (btn) btn.setAttribute('aria-pressed', (!isHidden).toString());
  try {
    localStorage.setItem('neuralchat_insights', (!isHidden).toString());
  } catch (e) {}
}

// ─────────────────────────────────────────────────────────────
// SCROLL MANAGEMENT
// ─────────────────────────────────────────────────────────────

export function scrollToBottom(container) {
  const el = container || $('chat-messages');
  if (el) {
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }
}

export function initScrollButton() {
  const container = $('chat-messages');
  const btn = $('scroll-bottom-btn');
  if (!container || !btn) return;

  container.addEventListener('scroll', () => {
    const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 60;
    btn.hidden = atBottom;
  });

  btn.addEventListener('click', () => scrollToBottom(container));
}

// ─────────────────────────────────────────────────────────────
// SPEECH SYNTHESIS (TTS)
// ─────────────────────────────────────────────────────────────

let ttsEnabled = false;
const TTS_KEY = 'neuralchat_tts';

export function initTTS() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    ttsEnabled = localStorage.getItem(TTS_KEY) === 'true';
  } catch (e) {}
  updateTTSButton();
}

export function toggleTTS() {
  ttsEnabled = !ttsEnabled;
  try {
    localStorage.setItem(TTS_KEY, ttsEnabled.toString());
  } catch (e) {}
  updateTTSButton();
  return ttsEnabled;
}

export function isTTSEnabled() {
  return ttsEnabled;
}

function updateTTSButton() {
  const btn = $('tts-btn');
  if (btn) {
    btn.setAttribute('aria-pressed', ttsEnabled.toString());
    btn.setAttribute('title', ttsEnabled ? 'Disable Text-to-Speech' : 'Enable Text-to-Speech');
  }
}

export function speak(text) {
  if (!ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const plain = text.replace(/\*\*?|`|#+|_{1,2}/g, '').replace(/\n/g, '. ').trim();
  window.speechSynthesis.cancel();

  const utt = new SpeechSynthesisUtterance(plain);
  utt.rate = 1.0;
  utt.pitch = 1.0;
  utt.lang = 'en-US';
  window.speechSynthesis.speak(utt);
}

// ─────────────────────────────────────────────────────────────
// VOICE INPUT (Web Speech API)
// ─────────────────────────────────────────────────────────────

let recognition = null;
let isListening = false;

export function initVoiceInput(onTranscript) {
  if (typeof window === 'undefined') return false;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return false;

  const btn = $('voice-btn');
  if (btn) btn.removeAttribute('hidden');

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    onTranscript(transcript);
  };

  recognition.onend = () => {
    isListening = false;
    updateVoiceButton(false);
  };

  recognition.onerror = () => {
    isListening = false;
    updateVoiceButton(false);
  };

  return true;
}

export function toggleVoice() {
  if (!recognition) return;
  if (isListening) {
    recognition.stop();
    isListening = false;
    updateVoiceButton(false);
  } else {
    recognition.start();
    isListening = true;
    updateVoiceButton(true);
  }
}

function updateVoiceButton(listening) {
  const btn = $('voice-btn');
  if (!btn) return;
  btn.setAttribute('aria-pressed', listening.toString());
  btn.setAttribute('title', listening ? 'Stop Voice Input' : 'Start Voice Input');
  btn.style.color = listening ? 'var(--primary)' : '';
}

// ─────────────────────────────────────────────────────────────
// AUTO-GROWING TEXTAREA & CHARACTER COUNTER
// ─────────────────────────────────────────────────────────────

export function initAutoGrow(textareaId = 'chat-input') {
  const ta = $(textareaId);
  if (!ta) return;

  const resize = () => {
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  };

  ta.addEventListener('input', resize);
}

export function updateCharCount(text, max = 500) {
  const el = $('char-count');
  if (!el) return;
  const rem = max - text.length;
  el.textContent = rem;
  el.style.color = rem < 50 ? 'var(--danger)' : '';
}

// ─────────────────────────────────────────────────────────────
// CONVERSATION PERSISTENCE
// ─────────────────────────────────────────────────────────────

const HISTORY_KEY = 'neuralchat_history';

export function persistMessages() {
  try {
    const container = $('chat-messages');
    if (!container) return;

    const messages = [];
    container.querySelectorAll('.message').forEach(msgEl => {
      const sender = msgEl.classList.contains('message--bot') ? 'bot' : 'user';
      const bubble = msgEl.querySelector('.message__bubble');
      const time = msgEl.querySelector('time');

      if (bubble && time) {
        messages.push({
          sender,
          text: sender === 'bot' ? bubble.innerHTML : (bubble.querySelector('p')?.textContent || bubble.textContent),
          time: time.getAttribute('datetime')
        });
      }
    });

    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-50)));
  } catch (e) {}
}

export function loadPersistedMessages(onChipClick) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      showWelcomeCard(onChipClick);
      return false;
    }

    const messages = JSON.parse(raw);
    if (!Array.isArray(messages) || messages.length === 0) {
      showWelcomeCard(onChipClick);
      return false;
    }

    const container = $('chat-messages');
    if (!container) return false;

    messages.forEach(({ sender, text, time }) => {
      if (!sender || !text) return;
      const msgEl = document.createElement('div');
      msgEl.className = `message message--${sender}`;

      const avatarInner = sender === 'bot'
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

      const timeStr = time ? new Date(time).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
      }) : '';

      const copyBtn = sender === 'bot'
        ? `<button class="copy-btn" title="Copy reply" aria-label="Copy message text">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
           </button>`
        : '';

      const bubbleContent = sender === 'bot' ? text : `<p>${escapeHTML(text)}</p>`;

      msgEl.innerHTML = `
        <div class="message__avatar" aria-hidden="true">${avatarInner}</div>
        <div class="message__content">
          <div class="message__bubble">${bubbleContent}</div>
          <div class="message__meta">
            <time datetime="${time || ''}">${timeStr}</time>
            ${copyBtn}
          </div>
        </div>
      `;

      if (sender === 'bot') {
        const btn = msgEl.querySelector('.copy-btn');
        if (btn) {
          btn.addEventListener('click', () => {
            const plain = msgEl.querySelector('.message__bubble')?.textContent || '';
            navigator.clipboard?.writeText(plain);
          });
        }
      }

      container.appendChild(msgEl);
    });

    scrollToBottom(container);
    return true;
  } catch (e) {
    showWelcomeCard(onChipClick);
    return false;
  }
}

export function showWelcomeCard(onChipClick) {
  const container = $('chat-messages');
  if (!container || container.querySelector('.welcome-card')) return;

  const card = document.createElement('div');
  card.className = 'welcome-card';
  card.innerHTML = `
    <div class="welcome-avatar" aria-hidden="true">🤖</div>
    <h2>Hi, I'm NeuralChat</h2>
    <p>Ask me about Natural Language Processing, Machine Learning, Deep Learning, coding tips, or just say hello!</p>
    <div class="welcome-chips">
      <button class="chip" type="button">What is NLP?</button>
      <button class="chip" type="button">What is tokenization?</button>
      <button class="chip" type="button">What is TF-IDF?</button>
      <button class="chip" type="button">What is stemming?</button>
      <button class="chip" type="button">Tell me a joke</button>
      <button class="chip" type="button">What can you do?</button>
    </div>
  `;

  card.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => onChipClick?.(btn.textContent));
  });

  container.appendChild(card);
}

export function clearHistory(onChipClick) {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {}

  const container = $('chat-messages');
  if (container) container.innerHTML = '';
  clearChips();
  showWelcomeCard(onChipClick);
}
