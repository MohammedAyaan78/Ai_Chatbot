/**
 * nlp.js – NeuralChat NLP Engine
 * 
 * A fully commented, educational Natural Language Processing pipeline
 * implementing:
 *   1. Text Normalization
 *   2. Tokenization
 *   3. Stop-word Removal
 *   4. Rule-based Stemming
 *   5. Synonym Mapping
 *   6. TF-IDF Cosine Similarity
 *   7. Jaccard Keyword Overlap
 *   8. Levenshtein Fuzzy Matching
 *   9. Special Handlers (math, time, date, name memory)
 *  10. Intent scoring & response selection
 * 
 * API: getResponse(text) → { reply, intent, confidence, suggestions, tokens, method }
 */

import { intents } from './knowledge.js';

// ─────────────────────────────────────────────────────────────
// 1. STOP-WORDS
// Common English words that carry little semantic meaning.
// Removing them reduces noise and focuses on content words.
// ─────────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'i','me','my','myself','we','our','ours','ourselves','you','your','yours',
  'yourself','yourselves','he','him','his','himself','she','her','hers',
  'herself','it','its','itself','they','them','their','theirs','themselves',
  'what','which','who','whom','this','that','these','those','am','is','are',
  'was','were','be','been','being','have','has','had','having','do','does',
  'did','doing','a','an','the','and','but','if','or','because','as','until',
  'while','of','at','by','for','with','about','against','between','into',
  'through','during','before','after','above','below','to','from','up','down',
  'in','out','on','off','over','under','again','further','then','once','here',
  'there','when','where','why','how','all','both','each','few','more','most',
  'other','some','such','no','nor','not','only','own','same','so','than',
  'too','very','s','t','can','will','just','don','should','now','d','ll',
  'm','o','re','ve','y','ain','aren','couldn','didn','doesn','hadn','hasn',
  'haven','isn','mightn','mustn','needn','shan','shouldn','wasn','weren',
  'won','wouldn','could','would','may','might','shall','ought','need',
  'dare','used','please','ok','okay','yeah','yes','yep','no','nope','hey',
  'oh','ah','uh','um','hmm','well', 'like', 'just', 'get', 'got', 'let'
]);

// ─────────────────────────────────────────────────────────────
// 2. SYNONYM MAP
// Maps alternate surface forms → canonical form.
// This expands coverage without duplicating patterns.
// ─────────────────────────────────────────────────────────────
const SYNONYM_MAP = {
  // Greetings
  'hi': 'hello', 'hey': 'hello', 'howdy': 'hello', 'hiya': 'hello',
  'helo': 'hello', 'hai': 'hello', 'sup': 'hello', 'yo': 'hello',
  // Farewells
  'bye': 'goodbye', 'cya': 'goodbye', 'ttyl': 'goodbye', 'adios': 'goodbye',
  'ciao': 'goodbye', 'later': 'goodbye',
  // Gratitude
  'thx': 'thanks', 'ty': 'thanks', 'cheers': 'thanks',
  // AI synonyms
  'artificial intelligence': 'ai', 'ml': 'machine learning',
  'dl': 'deep learning', 'nn': 'neural network',
  // NLP synonyms
  'natural language processing': 'nlp', 'text analysis': 'nlp',
  'computational linguistics': 'nlp',
  // Common contractions/abbrev
  'cant': 'cannot', 'dont': 'do not', 'wont': 'will not',
  'im': 'i am', 'ive': 'i have', 'id': 'i would',
  // Tech
  'js': 'javascript', 'py': 'python', 'html5': 'html', 'css3': 'css',
  'gpt': 'chatgpt', 'llm': 'large language model',
  // Common typos
  'wat': 'what', 'wut': 'what', 'teh': 'the', 'hte': 'the',
  'nlpp': 'nlp', 'aI': 'ai',
};

// ─────────────────────────────────────────────────────────────
// 3. NORMALIZATION
// Converts raw text to a consistent, comparable form.
// Step 1 of the NLP pipeline.
// ─────────────────────────────────────────────────────────────
function normalize(text) {
  // Convert to lowercase
  let s = text.toLowerCase();
  
  // Apply synonym map at phrase level (before word splitting)
  for (const [from, to] of Object.entries(SYNONYM_MAP)) {
    // Use word boundary matching for accuracy
    s = s.replace(new RegExp(`\\b${from}\\b`, 'g'), to);
  }
  
  // Remove punctuation (keep apostrophes for contractions temporarily)
  s = s.replace(/[^\w\s']/g, ' ');
  
  // Remove isolated apostrophes
  s = s.replace(/'/g, '');
  
  // Collapse multiple spaces into one
  s = s.replace(/\s+/g, ' ').trim();
  
  return s;
}

// ─────────────────────────────────────────────────────────────
// 4. TOKENIZATION
// Splits normalized text into an array of word tokens.
// After normalization, we simply split on spaces.
// ─────────────────────────────────────────────────────────────
function tokenize(text) {
  return text.split(' ').filter(t => t.length > 0);
}

// ─────────────────────────────────────────────────────────────
// 5. STOP-WORD REMOVAL
// Filters out high-frequency, low-information words.
// E.g., ["what", "is", "nlp"] → ["nlp"]
// ─────────────────────────────────────────────────────────────
function removeStopWords(tokens) {
  return tokens.filter(t => !STOP_WORDS.has(t) && t.length > 1);
}

// ─────────────────────────────────────────────────────────────
// 6. STEMMING
// Reduces inflected words to their base/root form.
// Rule-based: removes common English suffixes.
// 
// Examples:
//   "running" → "run"   (remove -ing)
//   "chatted" → "chat"  (remove -ed, -t dedup)
//   "quickly" → "quick" (remove -ly)
//   "learns"  → "learn" (remove -s)
//   "tokenization" → "token" (remove -ization)
// ─────────────────────────────────────────────────────────────
function stem(word) {
  // Must be long enough to stem (avoid stripping tiny words)
  if (word.length <= 3) return word;
  
  // Order matters: longer suffixes first
  const suffixRules = [
    // Very specific suffixes
    [/ization$/,  ''],   // tokenization → token
    [/isation$/,  ''],   // regularisation → regular
    [/ingness$/,  ''],   // meaningfulness → meaning (simplified)
    [/ational$/,   'ate'], // relational → relate
    [/tional$/,   'tion'], // conditional → condition (simplified)
    [/fulness$/,  'ful'],
    [/lessness$/,  'less'],
    [/iveness$/,  'ive'],
    [/ousness$/,  'ous'],
    // Standard suffixes
    [/nesses$/,   ''],   // happinesss → happi
    [/ness$/,     ''],   // happiness → happi
    [/ment$/,     ''],   // movement → move
    [/tion$/,     ''],   // prediction → predict
    [/sion$/,     ''],   // decision → decis
    [/ings$/,     ''],   // learnings → learn
    [/ing$/,      ''],   // running → run
    [/tion$/,     ''],
    [/ated$/,     'ate'], // generated → generate
    [/ened$/,     ''],   // listened → listen
    [/ed$/,       ''],   // learned → learn
    [/ers$/,      ''],   // learners → learn
    [/ies$/,      'y'],  // studies → study
    [/est$/,      ''],   // fastest → fast
    [/ness$/,     ''],
    [/ful$/,      ''],   // beautiful → beauti
    [/ous$/,      ''],   // famous → fam
    [/ive$/,      ''],   // reactive → react
    [/ize$/,      ''],   // tokenize → token
    [/ise$/,      ''],   // tokenise → token
    [/er$/,       ''],   // learner → learn
    [/ly$/,       ''],   // quickly → quick
    [/al$/,       ''],   // technical → technic
    [/ic$/,       ''],   // linguistic → linguist
    [/s$/,        ''],   // learns → learn
  ];
  
  let stemmed = word;
  for (const [pattern, replacement] of suffixRules) {
    if (pattern.test(stemmed) && stemmed.length > 4) {
      stemmed = stemmed.replace(pattern, replacement);
      // Only apply first matching rule
      break;
    }
  }
  
  // Deduplicate trailing chars caused by double consonant stems
  // E.g., "chatted" → "chatt" → "chat" after suffix removal
  stemmed = stemmed.replace(/(.)\1+$/, '$1');
  
  return stemmed.length > 0 ? stemmed : word;
}

// Process an array of tokens through stemming
function stemTokens(tokens) {
  return tokens.map(stem);
}

// ─────────────────────────────────────────────────────────────
// 7. FULL TEXT PROCESSING PIPELINE
// Chains: normalize → tokenize → removeStopWords → stem
// ─────────────────────────────────────────────────────────────
function processText(text) {
  const normalized  = normalize(text);
  const tokens      = tokenize(normalized);
  const noStops     = removeStopWords(tokens);
  const stemmed     = stemTokens(noStops);
  return { normalized, tokens, noStops, stemmed };
}

// ─────────────────────────────────────────────────────────────
// 8. JACCARD SIMILARITY
// Measures overlap between two sets.
// 
// Formula: |A ∩ B| / |A ∪ B|
// Range: [0, 1] where 1 = identical sets
// 
// Example:
//   A = {nlp, learn, text}
//   B = {nlp, process, text, machine}
//   Intersection = {nlp, text} → 2
//   Union = {nlp, learn, text, process, machine} → 5
//   Jaccard = 2/5 = 0.40
// ─────────────────────────────────────────────────────────────
function jaccardSimilarity(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 0;
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

// ─────────────────────────────────────────────────────────────
// 9. TF-IDF + COSINE SIMILARITY
// 
// TF (Term Frequency): how often a term appears in a document
//   TF(t, d) = count(t in d) / |d|
//
// IDF (Inverse Document Frequency): how rare a term is across all docs
//   IDF(t) = log(N / df(t))   where N = total docs, df = docs containing t
//
// TF-IDF(t, d) = TF(t, d) × IDF(t)
//
// Cosine Similarity:
//   cos(θ) = (A · B) / (|A| × |B|)
//   where A, B are TF-IDF vectors
// ─────────────────────────────────────────────────────────────

// Build IDF index from the intent corpus at load time
let idfIndex = null;
let intentCorpus = null; // Processed patterns per intent

function buildTFIDF() {
  if (idfIndex) return; // Already built
  
  // Build corpus: one "document" per intent (all patterns concatenated)
  intentCorpus = intents.map(intent => {
    const allText = intent.patterns.join(' ');
    const { stemmed } = processText(allText);
    return { id: intent.id, terms: stemmed };
  });
  
  const N = intentCorpus.length; // Total number of documents
  const dfMap = new Map(); // document frequency for each term
  
  for (const doc of intentCorpus) {
    const uniqueTerms = new Set(doc.terms);
    for (const term of uniqueTerms) {
      dfMap.set(term, (dfMap.get(term) || 0) + 1);
    }
  }
  
  // Compute IDF for each term
  // Add 1 to N and df to avoid division by zero (Laplace smoothing)
  idfIndex = new Map();
  for (const [term, df] of dfMap) {
    idfIndex.set(term, Math.log((N + 1) / (df + 1)) + 1);
  }
}

function computeTFIDFVector(terms) {
  // Count term frequencies
  const tf = new Map();
  for (const t of terms) tf.set(t, (tf.get(t) || 0) + 1);
  
  // Compute TF-IDF weighted vector
  const vec = new Map();
  for (const [term, count] of tf) {
    const tfVal = count / terms.length; // normalized TF
    const idfVal = idfIndex.get(term) || Math.log(2); // unknown term gets low IDF
    vec.set(term, tfVal * idfVal);
  }
  return vec;
}

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (const [term, valA] of vecA) {
    const valB = vecB.get(term) || 0;
    dotProduct += valA * valB;
    normA += valA * valA;
  }
  for (const [, valB] of vecB) {
    normB += valB * valB;
  }
  
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

// ─────────────────────────────────────────────────────────────
// 10. LEVENSHTEIN DISTANCE (Edit Distance)
// 
// Counts minimum single-character edits (insert, delete, substitute)
// needed to change one string into another.
// 
// Classic dynamic programming implementation.
// Time: O(m × n)  where m, n = string lengths
//
// Example: levenshtein("nlpp", "nlp") = 1 (delete 'p')
// ─────────────────────────────────────────────────────────────
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  
  // Create (m+1) × (n+1) matrix
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]; // Characters match — no cost
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // Deletion
          dp[i][j - 1],     // Insertion
          dp[i - 1][j - 1]  // Substitution
        );
      }
    }
  }
  
  return dp[m][n];
}

// Fuzzy score: how similar two words are (1 = identical, 0 = completely different)
function fuzzyWordScore(word, target) {
  const maxLen = Math.max(word.length, target.length);
  if (maxLen === 0) return 1;
  const dist = levenshtein(word, target);
  return 1 - dist / maxLen;
}

// Compute fuzzy match score between query tokens and intent pattern terms
function computeFuzzyScore(queryTokens, intentTerms) {
  if (queryTokens.length === 0 || intentTerms.length === 0) return 0;
  
  let totalScore = 0;
  for (const qToken of queryTokens) {
    let bestMatch = 0;
    for (const iToken of intentTerms) {
      // Only compare tokens of similar length (within 3 chars)
      if (Math.abs(qToken.length - iToken.length) <= 3) {
        bestMatch = Math.max(bestMatch, fuzzyWordScore(qToken, iToken));
      }
    }
    totalScore += bestMatch;
  }
  return totalScore / queryTokens.length;
}

// ─────────────────────────────────────────────────────────────
// 11. SPECIAL INTENT HANDLERS
// These intercept before standard scoring for exact handling.
// ─────────────────────────────────────────────────────────────

// In-memory session store (cleared on page refresh, persisted in localStorage for name)
const session = {
  userName: null,
  lastIntent: null,
  lastMessage: null,
};

// Load persisted name from localStorage
try {
  session.userName = localStorage.getItem('neuralchat_username') || null;
} catch (e) { /* storage unavailable */ }

/**
 * MATH HANDLER: Safely evaluates simple arithmetic expressions.
 * Uses a custom tokenizer — NEVER uses eval().
 * Supports: +, -, *, /, ^, %, sqrt, abs, parentheses
 */
function handleMath(text) {
  // Extract a numeric expression from the text
  // Match patterns like: "15 * 4", "what is 15+4", "sqrt(144)", etc.
  
  // First, try to extract a sqrt expression
  const sqrtMatch = text.match(/sqrt\s*\(?(\d+(?:\.\d+)?)\)?/i);
  if (sqrtMatch) {
    const n = parseFloat(sqrtMatch[1]);
    const result = Math.sqrt(n);
    return `√${n} = **${Number.isInteger(result) ? result : result.toFixed(4)}**`;
  }
  
  // Extract numeric expression: digits, operators, spaces, parens, decimal points
  // Remove all non-math characters except these
  const mathStr = text
    .replace(/what\s+is|calculate|compute|solve|how\s+much\s+is|equals?|equal\s+to/gi, '')
    .replace(/[a-z%]/gi, '') // remove all letters except e for scientific notation
    .replace(/\s+/g, '')
    .trim();
  
  if (!mathStr || !/\d/.test(mathStr)) return null;
  
  // Safe expression parser using recursive descent
  try {
    const result = safeEval(mathStr);
    if (typeof result !== 'number' || !isFinite(result)) return null;
    const formatted = Number.isInteger(result) ? result : parseFloat(result.toFixed(6));
    return `🧮 **${mathStr.replace(/\*/g, '×').replace(/\//g, '÷')} = ${formatted}**`;
  } catch (e) {
    return null;
  }
}

/**
 * Safe math expression evaluator — no eval().
 * Implements operator-precedence parsing for: +, -, *, /, ^, parentheses
 */
function safeEval(expr) {
  let pos = 0;
  
  function peek() { return expr[pos]; }
  function consume(ch) { if (expr[pos] !== ch) throw new Error(); pos++; }
  function skipSpaces() { while (pos < expr.length && expr[pos] === ' ') pos++; }
  
  function parseExpression() {
    return parseAddSub();
  }
  
  function parseAddSub() {
    let left = parseMulDiv();
    skipSpaces();
    while (pos < expr.length && (peek() === '+' || peek() === '-')) {
      const op = expr[pos++];
      const right = parseMulDiv();
      left = op === '+' ? left + right : left - right;
      skipSpaces();
    }
    return left;
  }
  
  function parseMulDiv() {
    let left = parsePower();
    skipSpaces();
    while (pos < expr.length && (peek() === '*' || peek() === '/' || peek() === '%')) {
      const op = expr[pos++];
      const right = parsePower();
      if (op === '*') left = left * right;
      else if (op === '/') {
        if (right === 0) throw new Error('Division by zero');
        left = left / right;
      } else left = left % right;
      skipSpaces();
    }
    return left;
  }
  
  function parsePower() {
    let base = parseUnary();
    skipSpaces();
    if (pos < expr.length && peek() === '^') {
      pos++;
      const exp = parseUnary();
      base = Math.pow(base, exp);
    }
    return base;
  }
  
  function parseUnary() {
    skipSpaces();
    if (peek() === '-') { pos++; return -parsePrimary(); }
    if (peek() === '+') { pos++; return parsePrimary(); }
    return parsePrimary();
  }
  
  function parsePrimary() {
    skipSpaces();
    if (peek() === '(') {
      pos++;
      const val = parseExpression();
      skipSpaces();
      consume(')');
      return val;
    }
    // Parse number (integer or decimal)
    let numStr = '';
    while (pos < expr.length && /[\d.]/.test(expr[pos])) {
      numStr += expr[pos++];
    }
    if (!numStr) throw new Error('Expected number');
    return parseFloat(numStr);
  }
  
  const result = parseExpression();
  if (pos !== expr.length) throw new Error('Unexpected characters');
  return result;
}

/** TIME HANDLER */
function handleTime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  });
  return `🕐 The current time is **${timeStr}**.`;
}

/** DATE HANDLER */
function handleDate() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  return `📅 Today is **${dateStr}**.`;
}

/** NAME SET HANDLER: extract and store user's name */
function handleSetName(text) {
  // Patterns: "my name is X", "I am X", "call me X", "you can call me X"
  const patterns = [
    /my name(?:'?s)?\s+is\s+([a-z]+)/i,
    /(?:call\s+me|i(?:'?m|\s+am)|i\s+go\s+by|people\s+call\s+me)\s+([a-z]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const name = match[1].trim();
      // Capitalize first letter
      const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
      session.userName = capitalizedName;
      try {
        localStorage.setItem('neuralchat_username', capitalizedName);
      } catch (e) { /* storage unavailable */ }
      return `Nice to meet you, **${capitalizedName}**! 😊 I'll remember your name. What would you like to know?`;
    }
  }
  return null;
}

/** NAME GET HANDLER: recall user's name */
function handleGetName() {
  if (session.userName) {
    return `Your name is **${session.userName}**! 😊 I remembered!`;
  }
  return `I don't know your name yet! Tell me with something like: *"My name is Alex"*.`;
}

// ─────────────────────────────────────────────────────────────
// 12. SPECIAL HANDLER PRE-FILTER
// Checks for special patterns before running the NLP scorer.
// Returns { reply, intent, confidence } or null if not triggered.
// ─────────────────────────────────────────────────────────────
function checkSpecialHandlers(rawText, normalizedText) {
  // ── Math: look for arithmetic expressions ──
  // Trigger on: numbers + operators
  if (/\d+\s*[\+\-\*\/\^%]\s*\d+|\d+\s*(?:plus|minus|times|divided|squared|sqrt)/.test(rawText) ||
      /(?:what\s+is|calculate|compute)\s+[\d\s\+\-\*\/\^\(\)\.]+/.test(rawText)) {
    const mathResult = handleMath(rawText);
    if (mathResult) {
      return { reply: mathResult, intent: 'math', confidence: 0.98, method: 'special:math' };
    }
  }
  
  // ── Time ──
  if (/\b(?:what\s+(?:is\s+)?(?:the\s+)?time|current\s+time|time\s+now|what\s+time)\b/i.test(rawText)) {
    return { reply: handleTime(), intent: 'current_time', confidence: 0.99, method: 'special:time' };
  }
  
  // ── Date ──
  if (/\b(?:what\s+(?:is\s+)?(?:the\s+)?date|today(?:'?s)?\s+date|what\s+day|current\s+date|what\s+(?:month|year))\b/i.test(rawText)) {
    return { reply: handleDate(), intent: 'current_date', confidence: 0.99, method: 'special:date' };
  }
  
  // ── Name set ──
  if (/\b(?:my\s+name\s+is|call\s+me|i(?:'?m|\s+am)|i\s+go\s+by)\b/i.test(rawText)) {
    const result = handleSetName(rawText);
    if (result) {
      return { reply: result, intent: 'set_name', confidence: 0.99, method: 'special:name_set' };
    }
  }
  
  // ── Name get ──
  if (/\b(?:what\s+(?:is\s+)?(?:my\s+)?name|do\s+you\s+(?:know|remember)\s+my\s+name|what(?:'?s|\s+is)\s+my\s+name)\b/i.test(rawText)) {
    return { reply: handleGetName(), intent: 'get_name', confidence: 0.99, method: 'special:name_get' };
  }
  
  return null; // No special handler matched
}

// ─────────────────────────────────────────────────────────────
// 13. INTENT SCORING
// Combines Jaccard, TF-IDF cosine, and Levenshtein scores.
//
// Final Score = w_j * Jaccard + w_t * TF-IDF + w_l * Levenshtein
//             = 0.40 * Jaccard + 0.40 * TF-IDF + 0.20 * Fuzzy
// ─────────────────────────────────────────────────────────────
const SCORE_WEIGHTS = { jaccard: 0.40, tfidf: 0.40, fuzzy: 0.20 };
const CONFIDENCE_THRESHOLD = 0.18; // Minimum score to claim an intent

function scoreIntent(queryTerms, intent, queryVec) {
  const { terms: intentTerms } = intentCorpus.find(c => c.id === intent.id) || { terms: [] };
  if (intentTerms.length === 0) return 0;
  
  const querySet  = new Set(queryTerms);
  const intentSet = new Set(intentTerms);
  
  // Jaccard similarity on stemmed term sets
  const jScore = jaccardSimilarity(querySet, intentSet);
  
  // TF-IDF cosine similarity
  const intentVec = computeTFIDFVector(intentTerms);
  const tScore    = cosineSimilarity(queryVec, intentVec);
  
  // Levenshtein fuzzy score (for typo tolerance)
  const lScore = computeFuzzyScore(queryTerms, intentTerms);
  
  // Weighted combination
  return SCORE_WEIGHTS.jaccard * jScore +
         SCORE_WEIGHTS.tfidf  * tScore +
         SCORE_WEIGHTS.fuzzy  * lScore;
}

// ─────────────────────────────────────────────────────────────
// 14. RESPONSE SELECTION
// Randomly pick from available responses for variety.
// Also tracks last response per intent to avoid repetition.
// ─────────────────────────────────────────────────────────────
const lastResponseIndices = new Map(); // intent_id → last_response_index

function selectResponse(intent) {
  const responses = intent.responses;
  
  // Filter out special handler tokens (they're handled upstream)
  const realResponses = responses.filter(r => !r.endsWith('_HANDLER'));
  if (realResponses.length === 0) return responses[0]; // fallback
  
  // Avoid repeating last response (if multiple options)
  let idx;
  if (realResponses.length === 1) {
    idx = 0;
  } else {
    const lastIdx = lastResponseIndices.get(intent.id) ?? -1;
    do {
      idx = Math.floor(Math.random() * realResponses.length);
    } while (idx === lastIdx && realResponses.length > 1);
  }
  
  lastResponseIndices.set(intent.id, idx);
  return realResponses[idx];
}

// ─────────────────────────────────────────────────────────────
// 15. FALLBACK + SUGGESTIONS
// When no intent matches above threshold, provide a helpful
// fallback with 3 topic suggestions.
// ─────────────────────────────────────────────────────────────
const FALLBACK_SUGGESTIONS = [
  'What is NLP?',
  'What is machine learning?',
  'Tell me a joke',
  'How does this chatbot work?',
  'What is TF-IDF?',
  'What can you do?',
];

function getFallbackSuggestions() {
  // Shuffle and pick 3
  const shuffled = [...FALLBACK_SUGGESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

// ─────────────────────────────────────────────────────────────
// 16. MAIN API: getResponse(text)
// 
// Runs the full NLP pipeline and returns:
//   {
//     reply:       string   – the bot's reply (markdown-lite supported)
//     intent:      string   – matched intent ID
//     confidence:  number   – [0, 1] confidence score
//     suggestions: string[] – follow-up chip suggestions
//     tokens:      string   – processed tokens for insights panel
//     method:      string   – scoring method used
//   }
// ─────────────────────────────────────────────────────────────
export function getResponse(rawText) {
  // Ensure TF-IDF index is built (lazy initialization)
  buildTFIDF();
  
  // Store original for special handlers
  const trimmedText = rawText.trim();
  
  // Step 1: Check special handlers first (math, time, date, name)
  const special = checkSpecialHandlers(trimmedText, normalize(trimmedText));
  if (special) {
    const intentObj = intents.find(i => i.id === special.intent);
    return {
      ...special,
      suggestions: intentObj?.followUps || getFallbackSuggestions(),
      tokens: '(special handler)',
    };
  }
  
  // Step 2: Full NLP pipeline
  const { stemmed, noStops } = processText(trimmedText);
  
  // Step 3: Build query TF-IDF vector
  const queryVec = computeTFIDFVector(stemmed);
  
  // Step 4: Score every intent (exclude fallback)
  const scorableIntents = intents.filter(i =>
    i.id !== 'fallback' && i.patterns.length > 0
  );
  
  const scored = scorableIntents.map(intent => ({
    intent,
    score: scoreIntent(stemmed, intent, queryVec),
  }));
  
  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);
  
  const best = scored[0];
  
  // Step 5: Decide intent vs fallback
  if (best && best.score >= CONFIDENCE_THRESHOLD) {
    const { intent, score } = best;
    const reply = selectResponse(intent);
    
    return {
      reply,
      intent: intent.id,
      confidence: score,
      suggestions: intent.followUps?.length ? intent.followUps : getFallbackSuggestions(),
      tokens: stemmed.join(', ') || noStops.join(', ') || '(empty)',
      method: score > 0.5 ? 'tfidf+jaccard' : 'fuzzy+jaccard',
    };
  }
  
  // Step 6: Fallback
  const fallbackIntent = intents.find(i => i.id === 'fallback');
  const suggestions = getFallbackSuggestions();
  
  return {
    reply: selectResponse(fallbackIntent) + 
      `\n\n💡 **Try asking:**\n${suggestions.map(s => `- *${s}*`).join('\n')}`,
    intent: 'fallback',
    confidence: best?.score || 0,
    suggestions,
    tokens: stemmed.join(', ') || '(no meaningful tokens)',
    method: 'fallback',
  };
}

/**
 * Utility: get user's stored name (for greeting personalization)
 */
export function getUserName() {
  return session.userName;
}

/**
 * Utility: clear session name
 */
export function clearSession() {
  session.userName = null;
  try { localStorage.removeItem('neuralchat_username'); } catch (e) {}
}
