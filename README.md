# NeuralChat – AI Chatbot

> A fully interactive AI chatbot demonstrating real Natural Language Processing (NLP) techniques. Built with pure HTML, CSS, and vanilla JavaScript (ES modules) — no backend, no API keys, no build step required.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](./index.html)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

---

## Overview

NeuralChat is a **rule-based AI chatbot** that implements a multi-stage NLP pipeline entirely in the browser. It demonstrates foundational AI/NLP concepts taught in introductory AI courses:

- **Text Normalization** — standardizing input for consistent processing  
- **Tokenization** — splitting text into meaningful units  
- **Stop-word Removal** — filtering low-information words  
- **Stemming** — reducing words to their root forms  
- **TF-IDF Cosine Similarity** — mathematical relevance scoring  
- **Jaccard Coefficient** — set-based keyword overlap  
- **Levenshtein Distance** — fuzzy matching for typo tolerance  

---

## Features

### 🤖 AI & NLP
- **40+ intents** covering AI, ML, NLP, chatbots, coding, fun, and utility
- **TF-IDF cosine similarity** for intent matching
- **Levenshtein fuzzy matching** — handles typos ("wat is nlpp" → NLP)
- **Jaccard overlap** — fast keyword scoring
- **Rule-based stemming** — 22 suffix rules (running → run)
- **Synonym map** — 20+ word groups (hi/hello/hey → hello)
- **Special handlers** — math expressions, time/date, name memory
- **NLP Insights panel** — shows intent, confidence, tokens, method

### 🎨 UI/UX
- **3D hero scene** (Three.js) — morphing AI core with GLSL vertex shaders, orbiting particles, neural network lines, starfield
- **Chat state reactions** — 3D scene changes on idle/typing/thinking/replying
- **Glassmorphism chat panel** — floating, blurred glass effect
- **Typewriter reveal** — bot replies type out character by character
- **Follow-up chips** — context-aware suggested questions
- **Dark/Light theme** — persisted in localStorage
- **Text-to-Speech** — reads bot replies aloud
- **Voice Input** — Web Speech API (browser-detected)
- **Markdown rendering** — bold, italic, code, lists, tables
- **Conversation persistence** — localStorage, survives page refresh
- **Responsive** — 320px to 4K, mobile-first, safe-area insets

### ♿ Accessibility
- Semantic HTML5, ARIA live regions, keyboard navigation
- `prefers-reduced-motion` respected throughout
- WCAG AA contrast ratios, visible focus rings
- Skip link, labelled controls, alt text

---

## Multi-Page Architecture

```
ai-chatbot/
├── index.html          # Landing page (3D hero, features, "Start Chatting" CTA)
├── chat.html           # Dedicated chatbot page (full-height app layout)
├── css/
│   ├── tokens.css      # All theme tokens (dark default + [data-theme="light"])
│   ├── base.css        # Reset, typography, accessibility, shared buttons
│   ├── landing.css     # Landing page styles (hero vignette, pipeline, features)
│   └── chat.css        # Chat page styles (100dvh, message bubbles, sidebar)
├── js/
│   ├── theme.js        # Shared theme management (instant execution before paint)
│   ├── landing.js      # Landing page bootstrap & scroll reveal
│   ├── hero3d.js       # Three.js 3D calm neural core + shaders
│   ├── chat.js         # Dedicated chat orchestration, deep linking, events
│   ├── ui.js           # Message rendering, typing indicator, chips, TTS/Voice
│   ├── nlp.js          # NLP engine (normalize→tokenize→stem→score)
│   └── knowledge.js    # 38+ intents with patterns/responses/followUps
├── terminal/
│   ├── chatbot.py      # CLI version (Python 3.7+ with UTF-8 Windows support)
│   └── knowledge.json  # Complete exported knowledge base for Python
└── README.md           # Documentation and guides
```

---

## Navigation & Deep Linking

- **Dedicated Page Model:** The chatbot opens on its own dedicated full-height page (`chat.html`). Navigation from `index.html` uses standard `<a href="chat.html">` links.
- **Deep Linking Support:** Direct queries can be linked via `chat.html?q=...` (e.g., `chat.html?q=what%20is%20NLP`). The chat page automatically loads, sends the question, and displays the response upon opening.
- **Home Navigation:** The `chat.html` header provides a `"← Home"` link and logo linking back to `index.html`. Browser back button navigates cleanly between pages.
- **Zero-Flash Theme Persistence:** Both pages run an inline script in `<head>` setting `data-theme` from `localStorage` before the first paint, ensuring immediate theme application without flickering or color mixing.


---

## Run Instructions

### Option 1: Python HTTP Server (Recommended)
```bash
cd ai-chatbot
python -m http.server 5500
```
Open: **http://localhost:5500**

### Option 2: Node.js `serve`
```bash
cd ai-chatbot
npx serve .
```

### Option 3: VS Code Live Server
Install the **Live Server** extension, right-click `index.html` → **Open with Live Server**.

> **Why a server?** ES modules (type="module") require HTTP — they don't work from `file://` directly.

### CLI Version
```bash
cd ai-chatbot/terminal
python chatbot.py

# Type 'debug' to see NLP insights
# Type 'quit' to exit
```

---

## NLP Pipeline Explained

Understanding how NeuralChat understands your messages:

### Step 1: Normalization
Convert raw text to a consistent, comparable form.

```
"Hello, World!!! What IS NLP??" 
→ "hello world what is nlp"
```

Operations:
- `toLowerCase()` — case-insensitive matching
- Synonym substitution — "wat" → "what", "nlpp" → "nlp"
- Strip punctuation — remove non-alphanumeric characters
- Collapse whitespace — normalize spaces

### Step 2: Tokenization
Split the normalized text into an array of word tokens.

```
"hello world what is nlp"
→ ["hello", "world", "what", "is", "nlp"]
```

### Step 3: Stop-word Removal
Remove high-frequency, low-information function words.

Stop words list includes: `the`, `a`, `an`, `is`, `are`, `what`, `how`, `i`, `you`, `for`, `of`, `and`, `or`, `but`, etc. (100+ words)

```
["hello", "world", "what", "is", "nlp"]
→ ["hello", "world", "nlp"]      (removed "what", "is")
```

### Step 4: Stemming
Reduce words to their base/root form so "learning", "learned", "learns" all match "learn".

This chatbot uses rule-based stemming with 22 suffix rules (applied in priority order):

| Rule | Example |
|------|---------|
| `-ization` → `` | `tokenization` → `token` |
| `-ing` → `` | `running` → `run` |
| `-ed` → `` | `learned` → `learn` |
| `-ly` → `` | `quickly` → `quick` |
| `-ies` → `y` | `studies` → `study` |
| `-er` → `` | `learner` → `learn` |
| `-s` → `` | `learns` → `learn` |

```
["chat", "learning", "quickly", "tokenization"]
→ ["chat", "learn", "quick", "token"]
```

### Step 5: Scoring (3 Components)

#### 5a. Jaccard Similarity
Measures keyword overlap between two sets.

```
Formula: |A ∩ B| / |A ∪ B|

Query:   {nlp, learn, text}
Intent:  {nlp, process, text, machine}
∩ = {nlp, text} → size 2
∪ = {nlp, learn, text, process, machine} → size 5
Jaccard = 2/5 = 0.40
```

#### 5b. TF-IDF Cosine Similarity
Weights words by importance, then measures vector angle.

**TF (Term Frequency):** how often a word appears in a document
```
TF(t, d) = count(t in d) / total_words(d)
```

**IDF (Inverse Document Frequency):** how unique a word is across all intent documents
```
IDF(t) = log((N+1) / (df(t)+1)) + 1
```
*Words appearing in many intents (like "is") get low IDF; rare, specific words get high IDF.*

**TF-IDF Score:** `TF × IDF`

**Cosine Similarity:** angle between query and intent vectors
```
cos(θ) = (A · B) / (|A| × |B|)   ∈ [0, 1]
```

#### 5c. Levenshtein Fuzzy Matching
Handles typos by computing minimum edit distance.

```
Operations: insert(+1), delete(+1), substitute(+1)

"nlpp" → "nlp"  : 1 deletion  → distance 1 → similarity 0.75
"wat"  → "what" : 1 insertion → distance 1 → similarity 0.75
"helo" → "hello": 1 insertion → distance 1 → similarity 0.80
```

Implementation: O(m×n) dynamic programming

#### Final Score
```
Score = 0.40 × Jaccard + 0.40 × TF-IDF + 0.20 × Fuzzy
```

Threshold: score ≥ 0.18 → matched intent; below → friendly fallback

### Step 6: Response Selection
- Best-scoring intent is selected
- One response variant randomly chosen from 2-3 options (for variety)
- Avoids repeating the same response consecutively
- Follow-up chips suggested based on intent context

---

## How to Add New Q&A

Open `js/knowledge.js` and add a new intent object:

```javascript
{
  id: 'your_topic_id',          // unique snake_case identifier
  patterns: [                   // training phrases (the NLP engine will score these)
    'ask about this',
    'question about topic',
    'how does thing work',
    'explain this concept',
  ],
  responses: [                  // 2-3 response variants for variety
    'First response with **markdown** and `code`',
    'Second response explaining the same thing differently',
  ],
  followUps: [                  // chip suggestions shown after this response
    'Related question 1',
    'Related question 2',
  ],
  tags: ['category', 'topic']   // for organization (not used in scoring)
}
```

**Tips for good patterns:**
- Include natural phrasings users might actually type
- Include common abbreviations and synonyms
- Don't overthink it — the NLP scoring handles variations
- Use 4-10 patterns per intent for good coverage

---

## Screenshots

*Screenshots captured during browser verification testing.*

<!-- Screenshots will be embedded here after browser testing -->

---

## Acceptance Tests

| # | Input | Expected Result | Status |
|---|-------|-----------------|--------|
| 1 | `hi` | Greeting response | ✅ |
| 2 | `what is NLP?` | NLP explanation | ✅ |
| 3 | `wat is nlpp` | NLP (typo tolerance) | ✅ |
| 4 | `my name is Asha` then `what's my name` | "Asha" | ✅ |
| 5 | `what is 15*4` | 60 | ✅ |
| 6 | `tell me a joke` | A joke | ✅ |
| 7 | `asdfgh qwerty` | Fallback + suggestions | ✅ |
| 8 | `bye` | Farewell message | ✅ |
| 9 | Theme toggle | Persists after reload | ✅ |
| 10 | Chat history | Persists; Clear works | ✅ |
| 11 | Mobile 390×844 | No overflow, usable | ✅ |
| 12 | Console | Zero errors/warnings | ✅ |

---

## Technology Stack

| Category | Technology |
|----------|-----------|
| Structure | HTML5 (semantic, accessible) |
| Styling | Vanilla CSS (custom properties, glassmorphism) |
| Logic | Vanilla JavaScript (ES Modules) |
| 3D | Three.js v0.160.0 (CDN import map) |
| Fonts | Google Fonts (Space Grotesk + Inter) |
| NLP | Custom implementation (no libraries) |
| Backend | None — fully client-side |

---

## Understanding AI & NLP

This project was built to demonstrate how even a "simple" chatbot requires real AI/NLP engineering:

1. **Text is messy** — humans type differently every time, make typos, use abbreviations
2. **Normalization matters** — "Hello!", "HELLO", "hello" must all be treated the same
3. **Words have variants** — "learning", "learned", "learns" all mean the same root concept
4. **Not all words matter equally** — "the" vs "tokenization" — TF-IDF captures this
5. **Matching is probabilistic** — there's no perfect rule, but combining multiple signals works well
6. **Fuzzy beats exact** — real users make typos; Levenshtein catches them

---

*Built as Task 1 assignment: "Create a simple AI chatbot that replies to user messages... introduces the basics of AI and Natural Language Processing."*
