/**
 * chat.js – Dedicated Chat Page Bootstrap & Orchestration (chat.html)
 */

import { getResponse } from './nlp.js';
import { initThemeToggle } from './theme.js';
import {
  addMessage, showTypingIndicator, hideTypingIndicator,
  renderChips, clearChips, updateInsights, toggleInsightsPanel,
  initTTS, toggleTTS, isTTSEnabled,
  initVoiceInput, toggleVoice,
  initAutoGrow, updateCharCount,
  initScrollButton, scrollToBottom,
  loadPersistedMessages, clearHistory,
  showWelcomeCard
} from './ui.js';

const $ = (id) => document.getElementById(id);

let isReplying = false;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme toggle
  initThemeToggle('#theme-btn');

  // 2. TTS & Voice Input
  initTTS();
  const voiceSupported = initVoiceInput(handleVoiceTranscript);
  if (voiceSupported) {
    const vBtn = $('voice-btn');
    if (vBtn) vBtn.removeAttribute('hidden');
  }

  // 3. Textarea auto-grow & scroll button
  initAutoGrow('chat-input');
  initScrollButton();

  // 4. Wire events
  wireChatEvents();

  // 5. Load persisted messages or show welcome
  loadPersistedMessages(handleSendMessage);

  // 6. Restore NLP insights toggle state if was open
  try {
    if (localStorage.getItem('neuralchat_insights') === 'true') {
      const panel = $('insights-panel');
      const btn = $('insights-btn');
      if (panel) panel.classList.remove('is-hidden');
      if (btn) btn.setAttribute('aria-pressed', 'true');
    }
  } catch (e) {}

  // 7. Check for Deep Link (?q=...)
  handleDeepLink();

  // 8. Auto-focus chat input
  setTimeout(() => {
    $('chat-input')?.focus();
  }, 100);
});

function wireChatEvents() {
  const form = $('chat-form');
  const input = $('chat-input');
  const clearBtn = $('clear-btn');
  const ttsBtn = $('tts-btn');
  const voiceBtn = $('voice-btn');
  const insightsBtn = $('insights-btn');
  const sidebarToggle = $('sidebar-toggle-btn');
  const newChatBtn = $('new-chat-btn');

  // Form submit
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) handleSendMessage(text);
  });

  // Enter to send, Shift+Enter for newline
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = input.value.trim();
      if (text) handleSendMessage(text);
    }
  });

  // Input char count
  input?.addEventListener('input', () => {
    updateCharCount(input.value);
  });

  // Clear chat
  clearBtn?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the conversation?')) {
      clearHistory(handleSendMessage);
      input?.focus();
    }
  });

  // New chat button in sidebar
  newChatBtn?.addEventListener('click', () => {
    clearHistory(handleSendMessage);
    input?.focus();
  });

  // TTS toggle
  ttsBtn?.addEventListener('click', toggleTTS);

  // Voice toggle
  voiceBtn?.addEventListener('click', toggleVoice);

  // NLP Insights toggle
  insightsBtn?.addEventListener('click', toggleInsightsPanel);

  // Close insights button
  $('insights-close-btn')?.addEventListener('click', toggleInsightsPanel);

  // Sidebar toggle
  sidebarToggle?.addEventListener('click', () => {
    const sidebar = $('chat-sidebar');
    if (!sidebar) return;
    const isCollapsed = sidebar.classList.toggle('is-collapsed');
    sidebarToggle.setAttribute('aria-expanded', (!isCollapsed).toString());
  });

  // Sidebar topics
  document.querySelectorAll('.topic-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const topic = btn.getAttribute('data-query') || btn.textContent.trim();
      handleSendMessage(topic);
    });
  });

  // Escape key non-destructive behavior (closes insights panel if open)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const panel = $('insights-panel');
      if (panel && !panel.classList.contains('is-hidden')) {
        toggleInsightsPanel();
      }
    }
  });
}

/**
 * Handle deep link URL query parameter: chat.html?q=...
 */
function handleDeepLink() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q');
  if (query && query.trim()) {
    // Clean URL so refresh doesn't resend
    window.history.replaceState({}, document.title, window.location.pathname);
    setTimeout(() => {
      handleSendMessage(query.trim());
    }, 250);
  }
}

/**
 * Handle message sending workflow
 */
export function handleSendMessage(rawText) {
  if (isReplying) return;

  const input = $('chat-input');
  if (input) {
    input.value = '';
    input.style.height = 'auto';
    updateCharCount('');
  }

  // 1. Render User Message
  addMessage('user', rawText);
  clearChips();

  // 2. Show Typing Indicator
  isReplying = true;
  showTypingIndicator();

  // 3. Process via NLP engine (with realistic typing delay 400-800ms)
  const delay = Math.max(400, Math.min(800, rawText.length * 15));

  setTimeout(() => {
    hideTypingIndicator();

    try {
      const response = getResponse(rawText);

      // 4. Render Bot Message
      addMessage('bot', response.reply, {
        animate: true,
        tts: isTTSEnabled()
      });

      // 5. Render Follow-up Suggestion Chips
      if (response.suggestions && response.suggestions.length > 0) {
        renderChips(response.suggestions, handleSendMessage);
      }

      // 6. Update NLP Insights panel
      updateInsights({
        intent: response.intent,
        confidence: response.confidence,
        tokens: response.tokens,
        method: response.method
      });
    } catch (err) {
      console.error('[NLP Execution Error]:', err);
      addMessage('bot', "I'm sorry, an error occurred while processing your request. Please try again.");
    } finally {
      isReplying = false;
      input?.focus();
    }
  }, delay);
}

function handleVoiceTranscript(transcript) {
  const input = $('chat-input');
  if (input) {
    input.value = transcript;
    updateCharCount(transcript);
    handleSendMessage(transcript);
  }
}
