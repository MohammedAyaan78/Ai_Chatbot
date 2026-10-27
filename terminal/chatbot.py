#!/usr/bin/env python3
"""
chatbot.py – NeuralChat CLI Version
====================================
A terminal-based chatbot that implements the same NLP pipeline as the
web version using Python. Uses knowledge.json as its knowledge base.

NLP Pipeline:
  1. Normalize (lowercase, strip punctuation)
  2. Tokenize (split on whitespace)
  3. Stop-word removal
  4. Rule-based stemming
  5. Synonym mapping
  6. TF-IDF cosine similarity
  7. Jaccard keyword overlap
  8. Levenshtein fuzzy matching

Run:
  python chatbot.py

Requirements: Python 3.7+ (no external libraries needed)
"""

import json
import math
import re
import os
import sys
from datetime import datetime
from typing import Optional

# Reconfigure stdout/stderr for Unicode/emoji support across all platforms (esp. Windows)
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass
if hasattr(sys.stderr, 'reconfigure'):
    try:
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass


# ──────────────────────────────────────────────────────────────
# 1. LOAD KNOWLEDGE BASE
# ──────────────────────────────────────────────────────────────
def load_knowledge(path: str = None) -> dict:
    """Load the knowledge base from knowledge.json."""
    if path is None:
        # Try same directory as this script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        path = os.path.join(script_dir, "knowledge.json")
    
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"[Warning] knowledge.json not found at {path}. Using minimal fallback.")
        return {"intents": [], "synonyms": {}, "stopWords": []}


# ──────────────────────────────────────────────────────────────
# 2. STOP WORDS
# ──────────────────────────────────────────────────────────────
STOP_WORDS = {
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
    'too','very','s','t','can','will','just','should','now','could','would',
    'may','might','shall','please','ok','okay','yeah','yes','yep','nope',
    'hey','oh','ah','uh','um','hmm','well','like','get','got','let'
}


# ──────────────────────────────────────────────────────────────
# 3. SYNONYM MAP
# ──────────────────────────────────────────────────────────────
SYNONYM_MAP = {
    'hi': 'hello', 'hey': 'hello', 'howdy': 'hello', 'hiya': 'hello',
    'bye': 'goodbye', 'cya': 'goodbye', 'ttyl': 'goodbye', 'adios': 'goodbye',
    'thx': 'thanks', 'ty': 'thanks', 'cheers': 'thanks',
    'ml': 'machine learning', 'dl': 'deep learning', 'nn': 'neural network',
    'js': 'javascript', 'py': 'python',
    'wat': 'what', 'wut': 'what', 'nlpp': 'nlp',
    'gpt': 'chatgpt', 'llm': 'large language model',
    'cant': 'cannot', 'dont': 'do not', 'wont': 'will not',
    'im': 'i am',
}


# ──────────────────────────────────────────────────────────────
# 4. NORMALIZATION
# ──────────────────────────────────────────────────────────────
def normalize(text: str) -> str:
    """
    Normalize input text:
      1. Convert to lowercase
      2. Apply synonym map
      3. Strip punctuation
      4. Collapse whitespace
    """
    s = text.lower()
    
    # Apply synonym substitutions
    for src, tgt in SYNONYM_MAP.items():
        s = re.sub(r'\b' + re.escape(src) + r'\b', tgt, s)
    
    # Remove non-alphanumeric characters (keep spaces)
    s = re.sub(r"[^\w\s]", ' ', s)
    
    # Collapse whitespace
    s = re.sub(r'\s+', ' ', s).strip()
    
    return s


# ──────────────────────────────────────────────────────────────
# 5. TOKENIZATION
# ──────────────────────────────────────────────────────────────
def tokenize(text: str) -> list[str]:
    """Split normalized text into word tokens."""
    return [t for t in text.split(' ') if t]


# ──────────────────────────────────────────────────────────────
# 6. STOP-WORD REMOVAL
# ──────────────────────────────────────────────────────────────
def remove_stop_words(tokens: list[str]) -> list[str]:
    """Filter out stop words and very short tokens."""
    return [t for t in tokens if t not in STOP_WORDS and len(t) > 1]


# ──────────────────────────────────────────────────────────────
# 7. RULE-BASED STEMMING
# ──────────────────────────────────────────────────────────────
SUFFIX_RULES = [
    (r'ization$',  ''),
    (r'isation$',  ''),
    (r'nesses$',   ''),
    (r'ness$',     ''),
    (r'ment$',     ''),
    (r'tion$',     ''),
    (r'sion$',     ''),
    (r'ings$',     ''),
    (r'ing$',      ''),
    (r'ated$',     'ate'),
    (r'ened$',     ''),
    (r'ed$',       ''),
    (r'ers$',      ''),
    (r'ies$',      'y'),
    (r'est$',      ''),
    (r'ous$',      ''),
    (r'ive$',      ''),
    (r'ize$',      ''),
    (r'ise$',      ''),
    (r'er$',       ''),
    (r'ly$',       ''),
    (r'al$',       ''),
    (r'ic$',       ''),
    (r's$',        ''),
]


def stem(word: str) -> str:
    """
    Apply rule-based stemming to reduce a word to its root form.
    
    Examples:
      'running' -> 'run'
      'quickly' -> 'quick'
      'tokenization' -> 'token'
    """
    if len(word) <= 3:
        return word
    
    stemmed = word
    for pattern, replacement in SUFFIX_RULES:
        if len(stemmed) > 4 and re.search(pattern, stemmed):
            stemmed = re.sub(pattern, replacement, stemmed)
            break  # Only apply first matching rule
    
    # Deduplicate trailing double consonants
    stemmed = re.sub(r'(.)\1+$', r'\1', stemmed)
    
    return stemmed if stemmed else word


def stem_tokens(tokens: list[str]) -> list[str]:
    return [stem(t) for t in tokens]


# ──────────────────────────────────────────────────────────────
# 8. FULL PIPELINE
# ──────────────────────────────────────────────────────────────
def process_text(text: str) -> tuple[list[str], list[str]]:
    """
    Run the full NLP pipeline.
    Returns (no_stops_tokens, stemmed_tokens)
    """
    normalized = normalize(text)
    tokens     = tokenize(normalized)
    no_stops   = remove_stop_words(tokens)
    stemmed    = stem_tokens(no_stops)
    return no_stops, stemmed


# ──────────────────────────────────────────────────────────────
# 9. LEVENSHTEIN DISTANCE
# ──────────────────────────────────────────────────────────────
def levenshtein(a: str, b: str) -> int:
    """
    Compute minimum edit distance between two strings.
    Operations: insert, delete, substitute (each cost 1).
    
    Uses dynamic programming: O(m*n) time, O(m*n) space.
    """
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    # Base cases
    for i in range(m + 1): dp[i][0] = i
    for j in range(n + 1): dp[0][j] = j
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i-1] == b[j-1]:
                dp[i][j] = dp[i-1][j-1]  # Match — no cost
            else:
                dp[i][j] = 1 + min(
                    dp[i-1][j],    # Deletion
                    dp[i][j-1],    # Insertion
                    dp[i-1][j-1]   # Substitution
                )
    
    return dp[m][n]


def fuzzy_word_score(word: str, target: str) -> float:
    """Normalize Levenshtein distance to [0, 1] similarity."""
    max_len = max(len(word), len(target))
    if max_len == 0:
        return 1.0
    return 1.0 - levenshtein(word, target) / max_len


def fuzzy_score(query_tokens: list[str], intent_terms: list[str]) -> float:
    """Best fuzzy match score from query tokens against intent terms."""
    if not query_tokens or not intent_terms:
        return 0.0
    
    total = 0.0
    for q in query_tokens:
        best = max(
            (fuzzy_word_score(q, t) for t in intent_terms
             if abs(len(q) - len(t)) <= 3),
            default=0.0
        )
        total += best
    return total / len(query_tokens)


# ──────────────────────────────────────────────────────────────
# 10. JACCARD SIMILARITY
# ──────────────────────────────────────────────────────────────
def jaccard(set_a: set, set_b: set) -> float:
    """
    |A ∩ B| / |A ∪ B|
    Range: [0, 1]. 1 = identical sets.
    """
    if not set_a and not set_b:
        return 0.0
    intersection = set_a & set_b
    union = set_a | set_b
    return len(intersection) / len(union)


# ──────────────────────────────────────────────────────────────
# 11. TF-IDF + COSINE SIMILARITY
# ──────────────────────────────────────────────────────────────
class TFIDFEngine:
    """Precomputes IDF for the intent corpus and scores queries."""
    
    def __init__(self, corpus: list[tuple[str, list[str]]]):
        """
        corpus: list of (intent_id, stemmed_terms)
        """
        self.corpus = corpus
        self.N      = len(corpus)
        self.idf    = self._build_idf()
    
    def _build_idf(self) -> dict[str, float]:
        """Compute IDF for each term across all intent documents."""
        df = {}
        for _, terms in self.corpus:
            for term in set(terms):
                df[term] = df.get(term, 0) + 1
        
        return {
            term: math.log((self.N + 1) / (count + 1)) + 1
            for term, count in df.items()
        }
    
    def tfidf_vector(self, terms: list[str]) -> dict[str, float]:
        """Compute TF-IDF vector for a list of tokens."""
        tf = {}
        for t in terms:
            tf[t] = tf.get(t, 0) + 1
        
        n = max(len(terms), 1)
        return {
            term: (count / n) * self.idf.get(term, math.log(2))
            for term, count in tf.items()
        }
    
    def cosine(self, vec_a: dict, vec_b: dict) -> float:
        """Cosine similarity between two TF-IDF vectors."""
        dot = sum(vec_a.get(t, 0) * v for t, v in vec_b.items())
        norm_a = math.sqrt(sum(v**2 for v in vec_a.values()))
        norm_b = math.sqrt(sum(v**2 for v in vec_b.values()))
        denom = norm_a * norm_b
        return dot / denom if denom > 0 else 0.0


# ──────────────────────────────────────────────────────────────
# 12. SPECIAL HANDLERS
# ──────────────────────────────────────────────────────────────
class Session:
    """Tracks user session state (name, etc.)."""
    user_name: Optional[str] = None


session = Session()


def handle_math(text: str) -> Optional[str]:
    """
    Safely evaluate simple arithmetic. NO eval() — uses ast.literal_eval
    indirectly via a safe tokenizer.
    """
    # Match basic arithmetic: number op number (op op number...)
    expr_match = re.search(r'(\d+(?:\.\d+)?(?:\s*[\+\-\*\/\^]\s*\d+(?:\.\d+)?)+)', text)
    if not expr_match:
        return None
    
    raw = expr_match.group(1).replace(' ', '')
    
    try:
        result = safe_eval(raw)
        if result is None:
            return None
        display = raw.replace('*', '×').replace('/', '÷')
        formatted = int(result) if result == int(result) else round(result, 6)
        return f"🧮 {display} = {formatted}"
    except Exception:
        return None


def safe_eval(expr: str) -> Optional[float]:
    """
    Recursive descent parser for arithmetic expressions.
    Supports: +, -, *, /, ^ (power), parentheses.
    Never uses eval().
    """
    pos = [0]  # Use list for mutability in nested functions
    
    def peek():
        return expr[pos[0]] if pos[0] < len(expr) else None
    
    def consume():
        ch = expr[pos[0]]
        pos[0] += 1
        return ch
    
    def parse_number():
        s = ''
        while pos[0] < len(expr) and (expr[pos[0]].isdigit() or expr[pos[0]] == '.'):
            s += consume()
        if not s:
            raise ValueError("Expected number")
        return float(s)
    
    def parse_primary():
        if peek() == '(':
            consume()  # '('
            val = parse_expr()
            if peek() == ')':
                consume()  # ')'
            return val
        elif peek() == '-':
            consume()
            return -parse_primary()
        return parse_number()
    
    def parse_power():
        base = parse_primary()
        if peek() == '^':
            consume()
            exp = parse_power()  # right-associative
            base = base ** exp
        return base
    
    def parse_term():
        left = parse_power()
        while peek() in ('*', '/'):
            op = consume()
            right = parse_power()
            if op == '*':
                left *= right
            else:
                if right == 0:
                    raise ZeroDivisionError
                left /= right
        return left
    
    def parse_expr():
        left = parse_term()
        while peek() in ('+', '-'):
            op = consume()
            right = parse_term()
            left = left + right if op == '+' else left - right
        return left
    
    return parse_expr()


def handle_time() -> str:
    now = datetime.now()
    return f"🕐 The current time is {now.strftime('%I:%M:%S %p')}."


def handle_date() -> str:
    now = datetime.now()
    return f"📅 Today is {now.strftime('%A, %B %d, %Y')}."


def handle_set_name(text: str) -> Optional[str]:
    patterns = [
        r'my name(?:\'?s)?\s+is\s+([a-z]+)',
        r'(?:call\s+me|i(?:\'?m|\s+am)|i\s+go\s+by)\s+([a-z]+)',
    ]
    for pat in patterns:
        m = re.search(pat, text.lower())
        if m:
            name = m.group(1).capitalize()
            session.user_name = name
            return f"Nice to meet you, {name}! I'll remember your name."
    return None


def handle_get_name() -> str:
    if session.user_name:
        return f"Your name is {session.user_name}! I remembered!"
    return "I don't know your name yet! Tell me: 'My name is Alex'."


def check_special(text: str) -> Optional[str]:
    """Check special handlers before NLP scoring."""
    # Math
    if re.search(r'\d+\s*[\+\-\*\/\^]\s*\d+', text):
        result = handle_math(text)
        if result:
            return result
    
    # Time
    if re.search(r'\b(?:what\s+(?:is\s+)?(?:the\s+)?time|current\s+time|time\s+now)\b', text, re.I):
        return handle_time()
    
    # Date
    if re.search(r'\b(?:what\s+(?:is\s+)?(?:the\s+)?date|today(?:\'?s)?\s+date|what\s+day)\b', text, re.I):
        return handle_date()
    
    # Set name
    if re.search(r'\b(?:my\s+name\s+is|call\s+me|i(?:\'?m|\s+am))\b', text, re.I):
        result = handle_set_name(text)
        if result:
            return result
    
    # Get name
    if re.search(r"\b(?:what\s+(?:is\s+)?my\s+name|what(?:'?s|\s+is)\s+my\s+name)\b", text, re.I):
        return handle_get_name()
    
    return None


# ──────────────────────────────────────────────────────────────
# 13. CHATBOT CLASS
# ──────────────────────────────────────────────────────────────
class NeuralChat:
    """
    Main chatbot class implementing the full NLP pipeline.
    """
    
    THRESHOLD  = 0.15  # Minimum confidence to claim an intent
    WEIGHTS    = {'jaccard': 0.40, 'tfidf': 0.40, 'fuzzy': 0.20}
    
    def __init__(self, knowledge: dict):
        self.intents  = knowledge.get('intents', [])
        self.fallback = next((i for i in self.intents if i['id'] == 'fallback'), None)
        
        # Preprocess intent patterns
        self.corpus = []
        for intent in self.intents:
            if intent['id'] == 'fallback':
                continue
            all_text = ' '.join(intent.get('patterns', []))
            _, stemmed = process_text(all_text)
            self.corpus.append((intent['id'], stemmed))
        
        # Build TF-IDF engine
        self.tfidf = TFIDFEngine(self.corpus)
        
        # Track last response per intent (for variety)
        self._last_response_idx = {}
        
        print(f"[NeuralChat] Loaded {len(self.intents)} intents, {len(self.corpus)} scorable.")
    
    def get_response(self, text: str) -> dict:
        """
        Main API: process input text and return response.
        
        Returns:
            {
              'reply':      str   – bot response
              'intent':     str   – matched intent ID
              'confidence': float – [0, 1] confidence score
              'method':     str   – scoring method used
            }
        """
        # Check special handlers first
        special = check_special(text)
        if special:
            return {
                'reply':      special,
                'intent':     'special',
                'confidence': 0.99,
                'method':     'special_handler'
            }
        
        # Run NLP pipeline
        _, stemmed = process_text(text)
        
        if not stemmed:
            return self._fallback_response()
        
        # Score each intent
        query_vec = self.tfidf.tfidf_vector(stemmed)
        query_set = set(stemmed)
        
        best_score  = 0.0
        best_intent = None
        
        for intent_id, intent_terms in self.corpus:
            intent_set = set(intent_terms)
            
            j_score = jaccard(query_set, intent_set)
            
            intent_vec = self.tfidf.tfidf_vector(intent_terms)
            t_score    = self.tfidf.cosine(query_vec, intent_vec)
            
            f_score = fuzzy_score(stemmed, intent_terms)
            
            score = (self.WEIGHTS['jaccard'] * j_score +
                     self.WEIGHTS['tfidf']   * t_score +
                     self.WEIGHTS['fuzzy']   * f_score)
            
            if score > best_score:
                best_score  = score
                best_intent = intent_id
        
        # Match threshold check
        if best_score >= self.THRESHOLD and best_intent:
            intent = next(i for i in self.intents if i['id'] == best_intent)
            reply  = self._pick_response(intent)
            return {
                'reply':      reply,
                'intent':     best_intent,
                'confidence': best_score,
                'method':     'tfidf+jaccard+fuzzy'
            }
        
        return self._fallback_response(best_score)
    
    def _pick_response(self, intent: dict) -> str:
        """Pick a response, avoiding immediate repetition."""
        responses = [r for r in intent.get('responses', []) if not r.endswith('_HANDLER')]
        if not responses:
            return "I'm not sure how to respond to that."
        
        if len(responses) == 1:
            return responses[0]
        
        import random
        last = self._last_response_idx.get(intent['id'], -1)
        idx  = last
        while idx == last:
            idx = random.randint(0, len(responses) - 1)
        
        self._last_response_idx[intent['id']] = idx
        return responses[idx]
    
    def _fallback_response(self, score: float = 0.0) -> dict:
        """Return a fallback response with suggestions."""
        if self.fallback:
            reply = self._pick_response(self.fallback)
        else:
            reply = "I'm not sure I understand. Try asking about AI, NLP, or machine learning!"
        
        return {
            'reply':      reply,
            'intent':     'fallback',
            'confidence': score,
            'method':     'fallback'
        }


# ──────────────────────────────────────────────────────────────
# 14. CLI INTERFACE
# ──────────────────────────────────────────────────────────────
def print_banner():
    """Display a nice ASCII banner."""
    print("\n" + "=" * 55)
    print("  ███╗   ██╗███████╗██╗   ██╗██████╗  █████╗ ██╗     ")
    print("  ████╗  ██║██╔════╝██║   ██║██╔══██╗██╔══██╗██║     ")
    print("  ██╔██╗ ██║█████╗  ██║   ██║██████╔╝███████║██║     ")
    print("  ██║╚██╗██║██╔══╝  ██║   ██║██╔══██╗██╔══██║██║     ")
    print("  ██║ ╚████║███████╗╚██████╔╝██║  ██║██║  ██║███████╗")
    print("  ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝")
    print("                   C H A T                            ")
    print("=" * 55)
    print("  AI Chatbot • NLP Demo • Python CLI Version")
    print("  Commands: 'quit' to exit | 'debug' to toggle NLP info")
    print("=" * 55 + "\n")


def print_separator():
    print("─" * 55)


def colorize(text: str, code: int) -> str:
    """ANSI color codes (fallback if not supported)."""
    if sys.platform == 'win32' and not os.environ.get('TERM'):
        return text
    return f"\033[{code}m{text}\033[0m"


def run_cli():
    """Main CLI loop."""
    print_banner()
    
    # Load knowledge base
    knowledge = load_knowledge()
    bot = NeuralChat(knowledge)
    
    print(colorize("NeuralChat: ", 36) + 
          "Hello! I'm NeuralChat, your AI learning companion.\n"
          "         Ask me anything about AI, NLP, or machine learning!\n"
          "         Type 'quit' to exit, 'debug' to see NLP insights.\n")
    print_separator()
    
    debug_mode = False
    
    while True:
        try:
            # Get user input
            user_input = input(colorize("\nYou: ", 32)).strip()
        except (EOFError, KeyboardInterrupt):
            print(colorize("\n\nNeuralChat: ", 36) + "Goodbye! 👋")
            break
        
        if not user_input:
            continue
        
        # CLI commands
        if user_input.lower() in ('quit', 'exit', 'bye', 'goodbye'):
            print(colorize("\nNeuralChat: ", 36) + "Goodbye! It was a pleasure chatting! 👋\n")
            break
        
        if user_input.lower() == 'debug':
            debug_mode = not debug_mode
            status = 'ON' if debug_mode else 'OFF'
            print(colorize(f"\n[Debug mode: {status}]", 33))
            continue
        
        if user_input.lower() in ('help', '?'):
            user_input = 'what can you do'
        
        # Get response from NLP engine
        result = bot.get_response(user_input)
        
        print()
        print(colorize("NeuralChat: ", 36) + result['reply'])
        
        # Show debug info if enabled
        if debug_mode:
            print()
            print(colorize("  ┌─ NLP Insights ─────────────────────────", 33))
            print(colorize(f"  │ Intent:     {result['intent']}", 33))
            print(colorize(f"  │ Confidence: {result['confidence']:.2%}", 33))
            print(colorize(f"  │ Method:     {result['method']}", 33))
            print(colorize("  └────────────────────────────────────────", 33))
        
        print_separator()


# ──────────────────────────────────────────────────────────────
# ENTRY POINT
# ──────────────────────────────────────────────────────────────
if __name__ == '__main__':
    run_cli()
