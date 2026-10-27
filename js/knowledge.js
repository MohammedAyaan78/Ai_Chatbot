/**
 * knowledge.js – NeuralChat Knowledge Base
 * 
 * 40+ intents, each with:
 *   id:         unique identifier for this intent
 *   patterns:   training phrases (raw text, normalized by NLP engine)
 *   responses:  2-3 response variants (randomly selected for variety)
 *   followUps:  suggested follow-up question chips
 *   tags:       category tags for grouping
 */

export const intents = [

  // ── GREETINGS ──────────────────────────────────────────────────────────────
  {
    id: 'greeting',
    patterns: [
      'hi', 'hello', 'hey', 'howdy', 'whats up', 'sup', 'good morning',
      'good afternoon', 'good evening', 'hiya', 'greetings', 'yo', 'salutations',
      'helo', 'helo there', 'hai'
    ],
    responses: [
      '👋 Hello! I\'m **NeuralChat**, your AI learning companion. Ask me anything about AI, machine learning, NLP, or programming!',
      '🤖 Hey there! Great to meet you! I can talk about **AI, NLP, deep learning**, coding, or even tell you a joke. What\'s on your mind?',
      '✨ Hi! Welcome to NeuralChat. I use real NLP techniques to understand you — try asking about `tokenization`, `TF-IDF`, or just say "help" to see what I can do!'
    ],
    followUps: ['What can you do?', 'What is NLP?', 'Tell me a joke'],
    tags: ['social', 'greeting']
  },

  // ── FAREWELLS ──────────────────────────────────────────────────────────────
  {
    id: 'farewell',
    patterns: [
      'bye', 'goodbye', 'see you', 'see ya', 'later', 'cya', 'good night',
      'goodnight', 'farewell', 'take care', 'ttyl', 'gotta go', 'signing off',
      'catch you later', 'bye bye', 'adios', 'ciao'
    ],
    responses: [
      '👋 Goodbye! It was a pleasure chatting with you. Come back anytime to explore more AI and NLP concepts!',
      '🌟 See you later! Remember — every conversation is an NLP problem waiting to be solved. Take care!',
      '✨ Bye! Thanks for chatting with NeuralChat. Keep exploring the fascinating world of AI! 🤖'
    ],
    followUps: ['Start over', 'What is AI?'],
    tags: ['social', 'farewell']
  },

  // ── THANKS ─────────────────────────────────────────────────────────────────
  {
    id: 'thanks',
    patterns: [
      'thanks', 'thank you', 'thank you so much', 'ty', 'thx', 'appreciated',
      'cheers', 'much appreciated', 'thanks a lot', 'great thanks', 'awesome thanks'
    ],
    responses: [
      '😊 You\'re very welcome! Learning is a journey — I\'m happy to help along the way.',
      '🙌 No problem at all! Is there anything else you\'d like to know about AI or NLP?',
      '💙 Happy to help! Feel free to ask more questions anytime!'
    ],
    followUps: ['What is machine learning?', 'How does NLP work?', 'Tell me a fun fact'],
    tags: ['social', 'gratitude']
  },

  // ── BOT IDENTITY ───────────────────────────────────────────────────────────
  {
    id: 'bot_identity',
    patterns: [
      'who are you', 'what are you', 'tell me about yourself', 'your name',
      'what is your name', 'are you a robot', 'are you ai', 'are you real',
      'are you human', 'what kind of bot', 'introduce yourself'
    ],
    responses: [
      '🤖 I\'m **NeuralChat**, an AI chatbot built to demonstrate Natural Language Processing! I use techniques like **TF-IDF cosine similarity**, **Jaccard overlap**, and **Levenshtein fuzzy matching** to understand your questions.',
      '✨ I\'m NeuralChat — a learning chatbot that implements a real NLP pipeline: normalize → tokenize → stem → score. No external AI APIs, just pure JavaScript logic!',
      '💡 I\'m NeuralChat, your guide to AI and NLP! I was built with vanilla JavaScript and Three.js. I understand 40+ intents using keyword matching, TF-IDF scoring, and fuzzy typo correction.'
    ],
    followUps: ['How do you work?', 'What is NLP?', 'What can you do?'],
    tags: ['meta', 'identity']
  },

  // ── CAPABILITIES / HELP ────────────────────────────────────────────────────
  {
    id: 'capabilities',
    patterns: [
      'what can you do', 'help', 'capabilities', 'features', 'what do you know',
      'what topics', 'what can i ask', 'how can you help', 'menu', 'options',
      'commands', 'show help', 'guide me'
    ],
    responses: [
      `🧠 Here's what I can help with:\n\n- **AI & ML** — concepts, algorithms, neural networks\n- **NLP** — tokenization, stemming, TF-IDF, embeddings\n- **Chatbots** — how they work, rule-based vs LLM\n- **Coding** — Python, JavaScript, HTML/CSS tips\n- **Math** — simple calculations like \`what is 15 * 4\`\n- **Fun** — jokes, facts, motivation\n- **Personal** — tell me your name and I'll remember it!\n\nTry asking: *"What is TF-IDF?"* or *"Tell me a joke"*`,
      `📋 I know about:\n1. **AI concepts** — machine learning, deep learning, neural nets\n2. **NLP techniques** — normalization, tokenization, stemming, TF-IDF, cosine similarity\n3. **Chatbot technology** — how rule-based and LLM bots differ\n4. **Programming** — Python, JS, HTML, CSS\n5. **Fun stuff** — jokes, facts, time & date\n\nJust ask naturally — I handle typos too! 😊`
    ],
    followUps: ['What is NLP?', 'Tell me a joke', 'What is machine learning?'],
    tags: ['meta', 'help']
  },

  // ── WHAT IS AI ─────────────────────────────────────────────────────────────
  {
    id: 'what_is_ai',
    patterns: [
      'what is ai', 'what is artificial intelligence', 'define ai',
      'explain artificial intelligence', 'ai meaning', 'tell me about ai',
      'what does ai mean', 'what is artificial', 'how does ai work'
    ],
    responses: [
      '🧠 **Artificial Intelligence (AI)** is the simulation of human intelligence by machines. It enables computers to:\n\n- **Learn** from data (Machine Learning)\n- **Understand language** (NLP)\n- **Recognize images** (Computer Vision)\n- **Make decisions** (Planning & Reasoning)\n\nAI powers everything from search engines to recommendation systems!',
      '💡 **AI (Artificial Intelligence)** refers to computer systems that can perform tasks that typically require human intelligence — like understanding speech, translating languages, playing games, or diagnosing diseases.\n\nModern AI is mostly powered by **machine learning**, especially **deep learning** with neural networks.',
      '🤖 Artificial Intelligence is a branch of computer science focused on building smart machines. Key branches include:\n- **ML** — learning from data\n- **NLP** — understanding text/speech\n- **Computer Vision** — understanding images\n- **Robotics** — physical AI agents'
    ],
    followUps: ['What is machine learning?', 'What is NLP?', 'What is deep learning?'],
    tags: ['ai', 'fundamentals']
  },

  // ── WHAT IS ML ─────────────────────────────────────────────────────────────
  {
    id: 'what_is_ml',
    patterns: [
      'what is machine learning', 'machine learning', 'ml meaning', 'define ml',
      'explain machine learning', 'how does ml work', 'what is supervised learning',
      'types of machine learning', 'ml vs ai'
    ],
    responses: [
      '📊 **Machine Learning (ML)** is a subset of AI where systems **learn from data** without being explicitly programmed.\n\nTypes of ML:\n- **Supervised** — learn from labeled examples (spam detection)\n- **Unsupervised** — find patterns in unlabeled data (clustering)\n- **Reinforcement** — learn by trial and error (game AI)\n\nThe algorithm improves with more data!',
      '🎯 **Machine Learning** gives computers the ability to learn and improve automatically from experience. Instead of writing explicit rules, you show the system thousands of examples and it figures out the patterns.\n\nExample: Show a spam filter millions of emails → it learns to detect spam!',
      '🔬 ML is the engine behind modern AI. The core idea: **data in → model trains → predictions out**.\n\nCommon algorithms include:\n- Linear/Logistic Regression\n- Decision Trees & Random Forests\n- Support Vector Machines\n- Neural Networks'
    ],
    followUps: ['What is deep learning?', 'What is NLP?', 'What are neural networks?'],
    tags: ['ai', 'ml']
  },

  // ── WHAT IS NLP ────────────────────────────────────────────────────────────
  {
    id: 'what_is_nlp',
    patterns: [
      'what is nlp', 'natural language processing', 'nlp meaning', 'define nlp',
      'explain nlp', 'how does nlp work', 'what is text processing',
      'what is language ai', 'nlp techniques', 'what does nlp mean',
      'wat is nlpp', 'what is nlp?', 'nlp', 'tell me about nlp'
    ],
    responses: [
      '📝 **Natural Language Processing (NLP)** is the branch of AI that helps computers **understand, interpret, and generate human language**.\n\nCore NLP tasks:\n- **Tokenization** — splitting text into words\n- **Stemming/Lemmatization** — reducing words to root forms\n- **POS Tagging** — identifying nouns, verbs, etc.\n- **NER** — finding names, dates, locations\n- **Sentiment Analysis** — detecting emotion\n- **Machine Translation** — e.g., Google Translate',
      '🗣️ **NLP (Natural Language Processing)** bridges human language and computers. It\'s how:\n- 📧 Email filters detect spam\n- 🔍 Search engines understand your queries\n- 🤖 Chatbots reply intelligently\n- 🌍 Translation apps work in real-time\n\nThis chatbot uses NLP to understand your messages!',
      '💬 **NLP** = making computers understand human language. The pipeline I use:\n1. **Normalize** → lowercase + clean text\n2. **Tokenize** → split into words\n3. **Remove stop-words** → drop "the", "is", "a"\n4. **Stem** → "running" → "run"\n5. **Score** → TF-IDF + Jaccard + Levenshtein\n6. **Match** → find best intent!'
    ],
    followUps: ['What is tokenization?', 'What is TF-IDF?', 'What is stemming?'],
    tags: ['nlp', 'fundamentals']
  },

  // ── WHAT IS DEEP LEARNING ──────────────────────────────────────────────────
  {
    id: 'what_is_dl',
    patterns: [
      'what is deep learning', 'deep learning', 'dl meaning', 'define deep learning',
      'explain deep learning', 'what are neural networks', 'how neural networks work',
      'layers in neural network', 'deep neural network'
    ],
    responses: [
      '🧬 **Deep Learning** is a subset of ML that uses **artificial neural networks** with many layers (hence "deep"). It excels at:\n\n- 🖼️ Image recognition (DALL-E, Stable Diffusion)\n- 🗣️ Speech synthesis (Siri, Alexa)\n- 📝 Text generation (GPT, Claude)\n- 🎮 Game playing (AlphaGo)\n\nInspired by how the human brain processes information!',
      '🧠 **Deep Learning** uses multi-layered neural networks to learn complex patterns. Key concepts:\n- **Neurons** — basic computation units\n- **Layers** — input, hidden, output\n- **Weights** — learned during training\n- **Backpropagation** — how the network learns\n- **Activation functions** — ReLU, sigmoid, softmax',
      '🔮 Deep Learning is the technology behind most AI breakthroughs since 2012. A deep network has dozens or hundreds of layers, each learning more abstract features. CNNs for images, RNNs/Transformers for text!'
    ],
    followUps: ['What are transformers?', 'What is machine learning?', 'How does ChatGPT work?'],
    tags: ['ai', 'deep_learning']
  },

  // ── NEURAL NETWORKS ────────────────────────────────────────────────────────
  {
    id: 'neural_networks',
    patterns: [
      'neural network', 'how do neural networks work', 'what is a neuron',
      'perceptron', 'backpropagation', 'gradient descent', 'what is cnn',
      'what is rnn', 'what is lstm', 'convolutional neural network'
    ],
    responses: [
      '🕸️ **Neural Networks** are computing systems loosely inspired by biological brains:\n\n- **Input layer** — receives raw data\n- **Hidden layers** — extract features\n- **Output layer** — makes predictions\n\nTraining: **Backpropagation** adjusts weights using **gradient descent** to minimize prediction error.',
      '⚡ A **Neural Network** is made of interconnected nodes (neurons). Each connection has a **weight** that gets adjusted during training. The network learns by:\n1. Making a prediction\n2. Calculating error (loss)\n3. Backpropagating the error\n4. Adjusting weights (gradient descent)\n5. Repeat thousands of times!'
    ],
    followUps: ['What is deep learning?', 'What are transformers?', 'What is backpropagation?'],
    tags: ['ai', 'neural_networks']
  },

  // ── TRANSFORMERS / GPT ────────────────────────────────────────────────────
  {
    id: 'transformers',
    patterns: [
      'what are transformers', 'transformer model', 'what is gpt', 'chatgpt',
      'how does chatgpt work', 'what is attention', 'self attention',
      'what is bert', 'large language model', 'llm', 'what is a llm'
    ],
    responses: [
      '🔄 **Transformers** are the architecture behind modern AI (GPT, BERT, Claude). Key innovation: **Self-Attention** — the model looks at every word in context when processing each word.\n\nThis lets it understand:\n- Long-range dependencies\n- Context and meaning\n- Relationships between words\n\nGPT = **G**enerative **P**retrained **T**ransformer',
      '🤖 **GPT (ChatGPT)** is a **Large Language Model (LLM)** trained on massive text datasets. It predicts the next token (word/subword) given context. Unlike this chatbot (rule-based), LLMs generate fluid, novel responses — but require billions of parameters and huge compute!'
    ],
    followUps: ['Rule-based vs LLM chatbots?', 'What is NLP?', 'What is deep learning?'],
    tags: ['ai', 'transformers', 'llm']
  },

  // ── TOKENIZATION ───────────────────────────────────────────────────────────
  {
    id: 'tokenization',
    patterns: [
      'what is tokenization', 'tokenization', 'what is a token', 'how does tokenization work',
      'explain tokens', 'text tokenization', 'word tokenization', 'subword tokenization'
    ],
    responses: [
      '✂️ **Tokenization** is splitting text into smaller units called **tokens** (usually words or subwords).\n\nExample:\n`"Hello world!"` → `["Hello", "world", "!"]`\n\nThis chatbot uses **word tokenization** — splitting on spaces after normalization. Modern LLMs use **subword tokenization** (BPE) — e.g., "tokenization" → ["token", "ization"]',
      '🔤 **Tokenization** is step 2 of the NLP pipeline here:\n1. Normalize: `"Hello, World!"` → `"hello world"`\n2. **Tokenize**: → `["hello", "world"]`\n3. Remove stop-words: → `["hello", "world"]` (neither is a stop-word)\n4. Stem: → `["hello", "world"]`\n\nTokens are the atomic units of text analysis!'
    ],
    followUps: ['What is stemming?', 'What is stop-word removal?', 'What is NLP?'],
    tags: ['nlp', 'tokenization']
  },

  // ── STEMMING ───────────────────────────────────────────────────────────────
  {
    id: 'stemming',
    patterns: [
      'what is stemming', 'stemming', 'what is lemmatization', 'lemmatization',
      'how does stemming work', 'stem words', 'word roots', 'morphological analysis'
    ],
    responses: [
      '🌱 **Stemming** reduces words to their root/base form:\n\n- `running` → `run`\n- `chatting` → `chat`\n- `quickly` → `quick`\n- `happily` → `happi`\n\nThis chatbot removes suffixes: `-ing`, `-ed`, `-s`, `-ly`, `-er`, `-est`, `-tion`, `-ness`.\n\nBenefit: "learn", "learning", "learned" all match the same intent!',
      '📚 **Stemming vs Lemmatization:**\n\n- **Stemming** — crude suffix removal (`studies` → `studi`)\n- **Lemmatization** — linguistic root (`studies` → `study`)\n\nThis chatbot uses rule-based stemming for speed. Real NLP systems (spaCy, NLTK) use lemmatization for accuracy!'
    ],
    followUps: ['What is tokenization?', 'What is TF-IDF?', 'What is NLP?'],
    tags: ['nlp', 'stemming']
  },

  // ── TF-IDF ─────────────────────────────────────────────────────────────────
  {
    id: 'tfidf',
    patterns: [
      'what is tfidf', 'tf idf', 'term frequency', 'inverse document frequency',
      'how does tfidf work', 'explain tfidf', 'tfidf cosine', 'cosine similarity',
      'document similarity', 'text similarity'
    ],
    responses: [
      '📐 **TF-IDF** (Term Frequency–Inverse Document Frequency) measures word importance:\n\n- **TF** = how often a word appears in this document\n- **IDF** = log(total docs / docs containing word)\n- **TF-IDF** = TF × IDF\n\nWords appearing in many docs (like "the") get low scores. Rare, specific words score higher!\n\nThis chatbot uses TF-IDF cosine similarity to score how closely your input matches each intent.',
      '🎯 **Cosine Similarity** with TF-IDF:\n1. Represent each intent as a vector of TF-IDF weights\n2. Represent your query as a vector\n3. Compute the **cosine** of the angle between them\n4. Score: `(A·B) / (|A| × |B|)` ∈ [0, 1]\n\nScore 1 = identical, Score 0 = unrelated. This chatbot blends it with Jaccard + Levenshtein!'
    ],
    followUps: ['What is stemming?', 'What is tokenization?', 'What is Levenshtein distance?'],
    tags: ['nlp', 'tfidf', 'similarity']
  },

  // ── LEVENSHTEIN / FUZZY MATCHING ──────────────────────────────────────────
  {
    id: 'levenshtein',
    patterns: [
      'levenshtein', 'edit distance', 'fuzzy matching', 'fuzzy search', 'typo correction',
      'spell check', 'what is levenshtein distance', 'how does fuzzy matching work',
      'what is edit distance', 'approximate string matching'
    ],
    responses: [
      '✏️ **Levenshtein Distance** measures the minimum edits to turn one string into another:\n- **Insertions**: `cat` → `cats` (+1)\n- **Deletions**: `cats` → `cat` (+1)\n- **Substitutions**: `cat` → `bat` (+1)\n\n`"nlpp"` → `"nlp"` = 1 deletion → close match!\n\nThis chatbot uses Levenshtein fuzzy matching so typos don\'t break responses.',
      '🔍 **Fuzzy Matching** = find the best match even with typos.\n\nExample: User types `"wat is nlpp"` → normalized → `"nlp"` tokens → Levenshtein distance to "nlp" = 1 → matches NLP intent with confidence ~0.65!\n\nThis is why `"wat is nlpp"` correctly triggers the NLP response. 🎉'
    ],
    followUps: ['What is TF-IDF?', 'What is NLP?', 'How does this chatbot work?'],
    tags: ['nlp', 'fuzzy', 'algorithms']
  },

  // ── EMBEDDINGS ─────────────────────────────────────────────────────────────
  {
    id: 'embeddings',
    patterns: [
      'what are embeddings', 'word embeddings', 'word2vec', 'glove embeddings',
      'vector space model', 'semantic similarity', 'word vectors', 'sentence embeddings',
      'what is word2vec'
    ],
    responses: [
      '📊 **Word Embeddings** map words to dense vectors in a continuous space:\n\n`king` → [0.21, -0.53, 0.78, ...]\n\nKey property: **king - man + woman ≈ queen**\n\nPopular models: **Word2Vec**, **GloVe**, **FastText**.\n\nModern LLMs use **contextual embeddings** (BERT, GPT) where the same word gets different vectors based on context!',
    ],
    followUps: ['What is TF-IDF?', 'What is deep learning?', 'What are transformers?'],
    tags: ['nlp', 'embeddings']
  },

  // ── SENTIMENT ANALYSIS ─────────────────────────────────────────────────────
  {
    id: 'sentiment',
    patterns: [
      'sentiment analysis', 'what is sentiment', 'opinion mining', 'emotion detection',
      'positive negative neutral', 'sentiment classification', 'how to detect sentiment'
    ],
    responses: [
      '😊😐😠 **Sentiment Analysis** classifies text as **positive, negative, or neutral**.\n\nApplications:\n- Product review analysis\n- Social media monitoring\n- Customer feedback processing\n- Stock market prediction from news\n\nApproaches: **lexicon-based** (keyword lists) or **ML-based** (trained classifiers).'
    ],
    followUps: ['What is NLP?', 'What is machine learning?', 'What is NER?'],
    tags: ['nlp', 'sentiment']
  },

  // ── NAMED ENTITY RECOGNITION ──────────────────────────────────────────────
  {
    id: 'ner',
    patterns: [
      'what is ner', 'named entity recognition', 'entity extraction', 'information extraction',
      'how does ner work', 'extract names from text', 'entity detection'
    ],
    responses: [
      '🏷️ **NER (Named Entity Recognition)** identifies and classifies key information in text:\n\n`"Elon Musk founded Tesla in 2003"` →\n- **PERSON**: Elon Musk\n- **ORG**: Tesla\n- **DATE**: 2003\n\nUsed in: search engines, document processing, knowledge graphs, chatbots!'
    ],
    followUps: ['What is NLP?', 'What is sentiment analysis?', 'What is machine learning?'],
    tags: ['nlp', 'ner']
  },

  // ── HOW CHATBOTS WORK ─────────────────────────────────────────────────────
  {
    id: 'how_chatbots_work',
    patterns: [
      'how do chatbots work', 'how does a chatbot work', 'chatbot internals',
      'how are chatbots built', 'chatbot architecture', 'how to build a chatbot',
      'how does this chatbot work', 'explain chatbot'
    ],
    responses: [
      '🔄 **How This Chatbot Works:**\n1. **Input** — user types a message\n2. **Normalize** — lowercase, strip punctuation\n3. **Tokenize** — split into words\n4. **Stem** — reduce to root forms\n5. **Score** — compare against 40+ intents using TF-IDF + Jaccard + Levenshtein\n6. **Match** — select best intent (if confidence ≥ threshold)\n7. **Respond** — pick a random response variant\n8. **Chips** — suggest follow-up questions',
      '🧩 Chatbots generally work in two ways:\n\n**Rule-based** (like this one):\n- Predefined Q&A pairs\n- Pattern matching + NLP scoring\n- Fast, predictable, explainable\n- Limited to known topics\n\n**LLM-based** (ChatGPT, Claude):\n- Trained on massive text data\n- Generates novel responses\n- Can handle any topic\n- Requires huge compute'
    ],
    followUps: ['Rule-based vs LLM?', 'What is NLP?', 'What is TF-IDF?'],
    tags: ['chatbots', 'architecture']
  },

  // ── RULE-BASED VS LLM ─────────────────────────────────────────────────────
  {
    id: 'rule_vs_llm',
    patterns: [
      'rule based vs llm', 'rule based chatbot', 'what is an llm chatbot',
      'traditional chatbot vs ai', 'difference between chatgpt and rule based',
      'generative ai vs rule based', 'llm vs traditional nlp'
    ],
    responses: [
      '⚖️ **Rule-Based vs LLM Chatbots:**\n\n| Feature | Rule-Based | LLM (GPT) |\n|---------|-----------|----------|\n| Responses | Predefined | Generated |\n| Flexibility | Limited | Very high |\n| Explainability | High | Low |\n| Cost | Free | Expensive |\n| Speed | Very fast | Slower |\n| Accuracy | High (in domain) | Variable |\n\nThis chatbot is rule-based — fast, free, and educational!'
    ],
    followUps: ['What are transformers?', 'How does ChatGPT work?', 'What is NLP?'],
    tags: ['chatbots', 'comparison']
  },

  // ── PYTHON HELP ────────────────────────────────────────────────────────────
  {
    id: 'python_help',
    patterns: [
      'python', 'help with python', 'python programming', 'learn python',
      'python for ai', 'python libraries', 'what python library for nlp',
      'how to start python', 'python nlp'
    ],
    responses: [
      '🐍 **Python for AI/NLP:**\n\nKey libraries:\n- `nltk` — classic NLP toolkit (tokenization, stemming, POS tagging)\n- `spacy` — fast industrial-strength NLP\n- `transformers` — Hugging Face: GPT, BERT, etc.\n- `scikit-learn` — ML algorithms + TF-IDF\n- `tensorflow` / `pytorch` — deep learning frameworks\n\nStart with: `pip install nltk spacy scikit-learn`',
      '📘 Python is the #1 language for AI. Quick start:\n```python\nimport nltk\nfrom sklearn.feature_extraction.text import TfidfVectorizer\n\nvectorizer = TfidfVectorizer()\nX = vectorizer.fit_transform(["hello world", "ai is cool"])\nprint(X.toarray())\n```\nThe bonus CLI chatbot in `terminal/chatbot.py` uses the same logic!'
    ],
    followUps: ['What is NLP?', 'What is TF-IDF?', 'JavaScript help?'],
    tags: ['coding', 'python']
  },

  // ── JAVASCRIPT HELP ───────────────────────────────────────────────────────
  {
    id: 'javascript_help',
    patterns: [
      'javascript', 'js', 'help with javascript', 'javascript programming',
      'learn javascript', 'vanilla js', 'javascript for ai', 'es modules',
      'what is javascript', 'node js'
    ],
    responses: [
      '⚡ **JavaScript for AI/NLP:**\n\nThis entire chatbot is built in **vanilla JS (ES modules)**! No backend needed.\n\nUseful JS NLP libraries:\n- `natural` — NLP toolkit for Node.js\n- `compromise` — lightweight NLP\n- `ml5.js` — ML in the browser\n- `tensorflow.js` — run TF models in browser\n\nThis chatbot implements TF-IDF and Levenshtein from scratch!',
      '💡 JavaScript is great for browser-based AI demos. ES module syntax:\n```javascript\nimport { getResponse } from \'./nlp.js\';\nconst { reply, intent, confidence } = getResponse("hello");\nconsole.log(reply);\n```\nCheck the `js/` folder for the full implementation!'
    ],
    followUps: ['What is machine learning?', 'Python help?', 'HTML/CSS help?'],
    tags: ['coding', 'javascript']
  },

  // ── HTML/CSS HELP ─────────────────────────────────────────────────────────
  {
    id: 'html_css_help',
    patterns: [
      'html', 'css', 'help with html', 'html css', 'web development',
      'learn html', 'learn css', 'how to make a website', 'web design',
      'flexbox', 'css grid', 'css variables'
    ],
    responses: [
      '🎨 **HTML/CSS Tips:**\n\nThis chatbot uses:\n- **CSS Custom Properties** (variables) for theming\n- **CSS Grid + Flexbox** for layout\n- **backdrop-filter** for glassmorphism\n- **CSS animations + transitions** for smooth UI\n- **clamp()** for fluid typography\n\nKey properties: `backdrop-filter: blur()`, `border: 1px solid rgba()`, `@keyframes`',
      '🌐 Web dev fundamentals:\n```css\n/* Glassmorphism effect */\n.glass {\n  background: rgba(255,255,255,0.1);\n  backdrop-filter: blur(20px);\n  border: 1px solid rgba(255,255,255,0.1);\n  border-radius: 20px;\n}\n```\nCheck `css/style.css` for the full design system!'
    ],
    followUps: ['JavaScript help?', 'Python help?', 'What is NLP?'],
    tags: ['coding', 'web']
  },

  // ── JOKES ─────────────────────────────────────────────────────────────────
  {
    id: 'jokes',
    patterns: [
      'tell me a joke', 'joke', 'make me laugh', 'funny', 'humor', 'comedy',
      'ai joke', 'computer joke', 'programmer joke', 'nerd joke', 'geek joke',
      'tell joke', 'say something funny'
    ],
    responses: [
      '😄 Why don\'t scientists trust atoms?\n\n**Because they make up everything!**',
      '🤖 Why did the neural network go to therapy?\n\n**It had too many hidden layers!**',
      '😂 How many machine learning engineers does it take to change a light bulb?\n\n**None — they just redefine "darkness" as the correct output!**',
      '💻 A programmer was asked: "Why do you prefer dark mode?"\n\n**"Because light attracts bugs!"**',
      '🧠 Why did the chatbot fail its exam?\n\n**Because it kept giving the same response — "I\'m sorry, I don\'t understand the question."**',
      '🤣 A data scientist walks into a bar, orders 0.7 beers.\n\n**The bartender says: "I\'ll round that up to 1." The data scientist says: "No no, that would bias my model!"**'
    ],
    followUps: ['Another joke', 'Tell me a fun fact', 'What is AI?'],
    tags: ['fun', 'jokes']
  },

  // ── FUN FACTS ─────────────────────────────────────────────────────────────
  {
    id: 'fun_facts',
    patterns: [
      'fun fact', 'interesting fact', 'tell me something interesting', 'did you know',
      'cool fact', 'amazing fact', 'ai fact', 'surprising fact', 'trivia'
    ],
    responses: [
      '🌟 **Fun Fact:** The term "Artificial Intelligence" was coined by **John McCarthy** in 1956 at the Dartmouth Conference — widely considered the birth of AI as a field!',
      '🤯 **Fun Fact:** GPT-4 has an estimated **1.76 trillion parameters**. A single parameter is just one number — but trillions together can write poetry, code software, and answer almost any question!',
      '📊 **Fun Fact:** The Levenshtein distance algorithm was published in 1966 by Russian mathematician Vladimir Levenshtein. It\'s still widely used today in spell-checkers, DNA sequencing, and — this chatbot! 🎉',
      '🧠 **Fun Fact:** The human brain has ~86 billion neurons. A modern large language model has ~1 trillion parameters. The brain still wins on efficiency — it runs on just **20 watts**!',
      '💡 **Fun Fact:** ELIZA, created in 1966, was one of the first chatbots. It used simple pattern matching to simulate a therapist — and some users genuinely thought they were talking to a human!'
    ],
    followUps: ['Tell me a joke', 'What is AI?', 'What is NLP?'],
    tags: ['fun', 'facts']
  },

  // ── STUDY TIPS ────────────────────────────────────────────────────────────
  {
    id: 'study_tips',
    patterns: [
      'study tips', 'how to study', 'how to learn ai', 'learn machine learning',
      'how to learn programming', 'best way to learn', 'study advice', 'resources',
      'where to learn', 'roadmap for ai', 'how to get into ai'
    ],
    responses: [
      '📚 **AI/NLP Learning Roadmap:**\n\n1. **Python** — learn basics (2-4 weeks)\n2. **Mathematics** — linear algebra, probability, calculus\n3. **ML Fundamentals** — scikit-learn, Kaggle courses\n4. **Deep Learning** — PyTorch or TensorFlow\n5. **NLP** — NLTK → spaCy → Hugging Face Transformers\n\nFree resources: **fast.ai**, **Coursera Andrew Ng ML**, **Hugging Face course**, **3Blue1Brown** videos!',
      '🎯 **Study Tips for Programmers:**\n- Build projects from day 1 (like this chatbot!)\n- Read documentation, not just tutorials\n- Implement algorithms from scratch (understand TF-IDF by coding it!)\n- Practice on Kaggle or LeetCode\n- Join communities: r/MachineLearning, Hugging Face Discord'
    ],
    followUps: ['Python help?', 'What is machine learning?', 'What is NLP?'],
    tags: ['education', 'study']
  },

  // ── MOTIVATION ────────────────────────────────────────────────────────────
  {
    id: 'motivation',
    patterns: [
      'motivate me', 'i need motivation', 'encourage me', 'inspirational quote',
      'keep going', 'feel like giving up', 'its hard', 'too difficult',
      'i cant do this', 'i give up', 'this is hard'
    ],
    responses: [
      '💪 "The expert in anything was once a beginner." Every AI researcher started by not knowing what a neural network was. Keep going — one concept at a time!',
      '🌟 "Code is like humor. When you have to explain it, it\'s bad." — Cory House\n\nYou\'re building something real right now. That already puts you ahead. Keep pushing!',
      '🔥 Remember: **Google, Netflix, OpenAI** all started with someone who didn\'t fully know what they were doing. Curiosity + consistency = mastery. You\'ve got this! 🚀'
    ],
    followUps: ['Study tips?', 'What is AI?', 'Tell me a joke'],
    tags: ['fun', 'motivation']
  },

  // ── TIME ──────────────────────────────────────────────────────────────────
  {
    id: 'current_time',
    patterns: [
      'what time is it', 'what is the time', 'current time', 'tell me the time',
      'time now', 'whats the time', 'what time'
    ],
    responses: ['TIME_HANDLER'],
    followUps: ['What is the date?', 'Tell me a fun fact'],
    tags: ['utility', 'time']
  },

  // ── DATE ──────────────────────────────────────────────────────────────────
  {
    id: 'current_date',
    patterns: [
      'what is the date', 'what date is it', 'todays date', 'what day is today',
      'current date', 'what is today', 'what month is it', 'what year is it'
    ],
    responses: ['DATE_HANDLER'],
    followUps: ['What time is it?', 'Tell me a fun fact'],
    tags: ['utility', 'date']
  },

  // ── MATH ──────────────────────────────────────────────────────────────────
  {
    id: 'math',
    patterns: [
      'what is', 'calculate', 'math', 'solve', 'compute', 'how much is',
      'what does equal', 'arithmetic', 'multiplication', 'addition', 'subtraction',
      'division', 'square root', 'percentage'
    ],
    responses: ['MATH_HANDLER'],
    followUps: ['Tell me a fun fact', 'What is NLP?'],
    tags: ['utility', 'math']
  },

  // ── USER NAME ─────────────────────────────────────────────────────────────
  {
    id: 'set_name',
    patterns: [
      'my name is', 'i am', 'call me', 'im called', 'you can call me',
      'my name\'s', 'people call me', 'i go by'
    ],
    responses: ['NAME_SET_HANDLER'],
    followUps: ['What is my name?', 'What can you do?'],
    tags: ['personal', 'name']
  },

  {
    id: 'get_name',
    patterns: [
      'what is my name', 'do you know my name', 'remember my name',
      'what did i tell you my name was', 'what\'s my name', 'whats my name',
      'my name', 'do you remember me'
    ],
    responses: ['NAME_GET_HANDLER'],
    followUps: ['Tell me a joke', 'What is NLP?'],
    tags: ['personal', 'name']
  },

  // ── WEATHER ───────────────────────────────────────────────────────────────
  {
    id: 'weather',
    patterns: [
      'weather', 'what is the weather', 'is it raining', 'will it rain',
      'temperature outside', 'weather today', 'forecast'
    ],
    responses: [
      '🌤️ I\'m a chatbot without internet access, so I can\'t check live weather! Try asking Google or a weather app.\n\nWhat I *can* tell you: the weather of the NLP world is **always sunny** ☀️ — there\'s always something new to learn!'
    ],
    followUps: ['Tell me a fun fact', 'What is AI?'],
    tags: ['utility']
  },

  // ── HOBBIES / GENERAL CHAT ────────────────────────────────────────────────
  {
    id: 'hobbies',
    patterns: [
      'what are your hobbies', 'do you have hobbies', 'what do you like',
      'do you like', 'your favorite', 'what is your favorite', 'do you enjoy'
    ],
    responses: [
      '🤖 As an AI chatbot, I don\'t have hobbies in the traditional sense — but I *love* processing text, matching intents, and computing TF-IDF scores!\n\nMy true passion? Helping humans understand AI and NLP. 😄',
      '💙 My hobbies include:\n- 📊 Computing cosine similarity\n- ✂️ Tokenizing sentences\n- 🌱 Stemming words to their roots\n- 🔍 Fuzzy matching typos\n\nBasically: all things NLP! What are *your* hobbies? 😊'
    ],
    followUps: ['Tell me a joke', 'What is NLP?', 'What can you do?'],
    tags: ['social', 'general']
  },

  // ── RIDDLE ────────────────────────────────────────────────────────────────
  {
    id: 'riddle',
    patterns: [
      'riddle', 'give me a riddle', 'brain teaser', 'puzzle', 'ask me a riddle'
    ],
    responses: [
      '🧩 Here\'s a riddle:\n\n**"I have a head and a tail but no body. What am I?"**\n\n*(Think about it... and type your answer!)*\n\nAnswer: A **coin**! 🪙',
      '🤔 Riddle time!\n\n**"The more you take, the more you leave behind. What am I?"**\n\nAnswer: **Footsteps!** 👣',
      '🧠 AI Riddle:\n\n**"I learn from data, I predict the future, I improve over time, but I have no consciousness. What am I?"**\n\nAnswer: A **Machine Learning model!** 🤖'
    ],
    followUps: ['Another riddle', 'Tell me a joke', 'Fun fact please'],
    tags: ['fun', 'riddle']
  },

  // ── WHAT IS THIS APP ──────────────────────────────────────────────────────
  {
    id: 'about_app',
    patterns: [
      'what is this app', 'what is this', 'about this app', 'this website',
      'about neuralchat', 'what did you build', 'how was this made',
      'who built this', 'tech stack', 'how is this made'
    ],
    responses: [
      '🚀 **NeuralChat** is a demonstration of NLP techniques built with:\n\n- **HTML5 + CSS3** — semantic, accessible markup\n- **Vanilla JavaScript (ES modules)** — no framework needed!\n- **Three.js** — 3D animated hero scene\n- **Google Fonts** — Space Grotesk + Inter\n\nThe NLP engine implements TF-IDF, Jaccard similarity, and Levenshtein distance from scratch. Check the `README.md` for full docs!',
    ],
    followUps: ['How does this chatbot work?', 'What is NLP?', 'What can you do?'],
    tags: ['meta', 'app']
  },

  // ── REPEAT / CLARIFY ──────────────────────────────────────────────────────
  {
    id: 'repeat',
    patterns: [
      'repeat', 'say that again', 'what did you say', 'can you repeat',
      'pardon', 'what', 'come again', 'huh', 'sorry what'
    ],
    responses: [
      'Sorry, could you rephrase your question? I want to make sure I understand you correctly!',
      'Let me know what you\'d like to know — try asking about AI, NLP, machine learning, or just say "help"!',
      'I\'m not sure what to repeat! Could you ask me a specific question? Try "What is NLP?" or "Tell me a joke".'
    ],
    followUps: ['What can you do?', 'What is NLP?', 'Tell me a joke'],
    tags: ['meta', 'clarify']
  },

  // ── FALLBACK ──────────────────────────────────────────────────────────────
  {
    id: 'fallback',
    patterns: [],
    responses: [
      '🤔 Hmm, I\'m not sure I caught that. I\'m still learning!\n\nTry asking about: **AI, NLP, machine learning, Python**, or type "help" for a full list of topics.',
      '🧩 I didn\'t quite understand that — could you rephrase? Here are some things I know about:\n- **What is NLP?**\n- **How does machine learning work?**\n- **Tell me a joke**',
      '💭 That one\'s a bit outside my knowledge base! I specialize in **AI, NLP, and programming topics**. Try "help" to see everything I can discuss!'
    ],
    followUps: [],
    tags: ['fallback']
  }
];

/**
 * Flat list of all intent IDs mapped to their follow-ups,
 * used by the UI chip system.
 */
export const intentFollowUps = Object.fromEntries(
  intents.map(i => [i.id, i.followUps])
);
