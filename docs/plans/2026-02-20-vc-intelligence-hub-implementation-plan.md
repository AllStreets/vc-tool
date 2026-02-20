# VC Intelligence Hub Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Build a trend-first intelligence platform for VCs that aggregates market signals from GitHub, Twitter, News, AngelList, and Serper to identify emerging opportunities and map founder networks.

**Architecture:** Plugin-based backend with graceful API degradation + React frontend with interconnected data visualization. Trends engine scores and ranks market signals; clicking trends surfaces relevant deals and founder networks. All data cached for cost efficiency.

**Tech Stack:** Node.js/Express backend, React 18 + Vite + Tailwind frontend, PostgreSQL database, plugin architecture for API sources (GitHub, Twitter, NewsAPI, AngelList, Serper), Recharts for visualizations.

---

## PHASE 1: Backend Infrastructure & API Plugins

### Task 1: Initialize Backend Project Structure

**Files:**
- Create: `backend/package.json`
- Create: `backend/server.js`
- Create: `backend/.env.example`
- Create: `backend/.gitignore`
- Create: `backend/config/apiPlugins.js`
- Create: `backend/services/cache.js`
- Create: `backend/utils/logger.js`

**Step 1: Create package.json**

```bash
mkdir -p backend
cd backend
cat > package.json << 'EOF'
{
  "name": "vc-intelligence-hub-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "node-cache": "^5.1.2",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF
```

**Step 2: Create server.js with basic Express setup**

```bash
cat > server.js << 'EOF'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Placeholder endpoints (will implement in later tasks)
app.get('/api/trends', (req, res) => {
  res.json({ trends: [], message: 'Trends endpoint not yet implemented' });
});

app.get('/api/deals', (req, res) => {
  res.json({ deals: [], message: 'Deals endpoint not yet implemented' });
});

app.get('/api/founders', (req, res) => {
  res.json({ founders: [], message: 'Founders endpoint not yet implemented' });
});

app.get('/api/api-status', (req, res) => {
  res.json({ apis: {}, message: 'API status endpoint not yet implemented' });
});

app.listen(PORT, () => {
  console.log(`VC Intelligence Hub backend running on http://localhost:${PORT}`);
});
EOF
```

**Step 3: Create .env.example**

```bash
cat > .env.example << 'EOF'
PORT=5000
NODE_ENV=development

# GitHub API
GITHUB_TOKEN=your_github_token

# Twitter API
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# NewsAPI
NEWSAPI_KEY=your_newsapi_key

# AngelList API
ANGELLIST_API_KEY=your_angellist_api_key

# Serper API
SERPER_API_KEY=your_serper_api_key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vc_intelligence

# Cache settings
CACHE_TTL_HOURS=4
EOF
```

**Step 4: Create .gitignore**

```bash
cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
.DS_Store
*.log
dist/
build/
EOF
```

**Step 5: Create plugin configuration file**

```bash
mkdir -p config
cat > config/apiPlugins.js << 'EOF'
// Plugin configuration - controls which API sources are active
export const PLUGIN_CONFIG = {
  github: {
    enabled: !!process.env.GITHUB_TOKEN,
    name: 'GitHub Trends',
    methods: ['fetchTrends', 'fetchFounders']
  },
  twitter: {
    enabled: !!process.env.TWITTER_BEARER_TOKEN,
    name: 'Twitter Trends',
    methods: ['fetchTrends', 'fetchDeals']
  },
  newsapi: {
    enabled: !!process.env.NEWSAPI_KEY,
    name: 'News API',
    methods: ['fetchTrends', 'fetchDeals']
  },
  angellist: {
    enabled: !!process.env.ANGELLIST_API_KEY,
    name: 'AngelList',
    methods: ['fetchDeals', 'fetchFounders']
  },
  serper: {
    enabled: !!process.env.SERPER_API_KEY,
    name: 'Serper Search',
    methods: ['fetchTrends', 'fetchDeals']
  }
};

export const getActivePlugins = () => {
  return Object.entries(PLUGIN_CONFIG)
    .filter(([_, config]) => config.enabled)
    .map(([name, config]) => ({ name, ...config }));
};

export const getPluginStatus = () => {
  return Object.fromEntries(
    Object.entries(PLUGIN_CONFIG).map(([name, config]) => [
      name,
      { enabled: config.enabled, name: config.name }
    ])
  );
};
EOF
```

**Step 6: Create cache utility**

```bash
mkdir -p services
cat > services/cache.js << 'EOF'
import NodeCache from 'node-cache';

const CACHE_TTL_HOURS = parseInt(process.env.CACHE_TTL_HOURS || '4', 10);
const cache = new NodeCache({ stdTTL: CACHE_TTL_HOURS * 3600, checkperiod: 600 });

export const getCached = (key) => cache.get(key);
export const setCached = (key, value) => cache.set(key, value);
export const deleteCached = (key) => cache.del(key);
export const flushCache = () => cache.flushAll();

export default cache;
EOF
```

**Step 7: Create logger utility**

```bash
mkdir -p utils
cat > utils/logger.js << 'EOF'
const log = (level, message, data = {}) => {
  console.log(`[${new Date().toISOString()}] [${level}] ${message}`, data);
};

export const logger = {
  info: (msg, data) => log('INFO', msg, data),
  error: (msg, data) => log('ERROR', msg, data),
  warn: (msg, data) => log('WARN', msg, data),
  debug: (msg, data) => log('DEBUG', msg, data)
};

export default logger;
EOF
```

**Step 8: Install dependencies**

```bash
npm install
```

**Step 9: Create .env from .env.example (user will fill in API keys)**

```bash
cp .env.example .env
# User will manually add API keys here
```

**Step 10: Test server starts**

```bash
npm run dev
```

Expected: `VC Intelligence Hub backend running on http://localhost:5000`

**Step 11: Verify health endpoint works**

```bash
curl http://localhost:5000/api/health
```

Expected: `{"status":"ok","timestamp":"2026-02-20T..."}`

**Step 12: Commit**

```bash
cd ..
git add backend/package.json backend/server.js backend/.env.example backend/.gitignore backend/config/apiPlugins.js backend/services/cache.js backend/utils/logger.js
git commit -m "feat: initialize backend project structure with Express and plugin configuration"
```

---

### Task 2: Create Plugin Architecture Framework

**Files:**
- Create: `backend/plugins/basePlugin.js`
- Create: `backend/plugins/pluginManager.js`
- Create: `backend/services/pluginService.js`

**Step 1: Create base plugin class**

```bash
mkdir -p backend/plugins
cat > backend/plugins/basePlugin.js << 'EOF'
import { logger } from '../utils/logger.js';

export class BasePlugin {
  constructor(name) {
    this.name = name;
    this.enabled = true;
  }

  async fetchTrends() {
    throw new Error(`${this.name}: fetchTrends() not implemented`);
  }

  async fetchDeals() {
    throw new Error(`${this.name}: fetchDeals() not implemented`);
  }

  async fetchFounders() {
    throw new Error(`${this.name}: fetchFounders() not implemented`);
  }

  async fetchData(method, params = {}) {
    try {
      if (!this[method]) {
        throw new Error(`Method ${method} not found in ${this.name}`);
      }
      logger.info(`${this.name}: Fetching ${method}`, params);
      const result = await this[method](params);
      logger.info(`${this.name}: ${method} successful`, { count: result?.length || 0 });
      return result;
    } catch (error) {
      logger.error(`${this.name}: Error in ${method}`, { error: error.message });
      return [];
    }
  }
}

export default BasePlugin;
EOF
```

**Step 2: Create plugin manager**

```bash
cat > backend/plugins/pluginManager.js << 'EOF'
import { logger } from '../utils/logger.js';

export class PluginManager {
  constructor() {
    this.plugins = new Map();
  }

  registerPlugin(name, plugin) {
    if (!(plugin instanceof BasePlugin)) {
      throw new Error(`Plugin must extend BasePlugin`);
    }
    this.plugins.set(name, plugin);
    logger.info(`Plugin registered: ${name}`);
  }

  async fetchFromAllPlugins(method, params = {}) {
    const results = [];
    const failures = [];

    for (const [name, plugin] of this.plugins) {
      if (!plugin.enabled) continue;

      try {
        const data = await plugin.fetchData(method, params);
        results.push({ source: name, data });
      } catch (error) {
        failures.push({ source: name, error: error.message });
        logger.warn(`Plugin ${name} failed for ${method}`, { error: error.message });
      }
    }

    return { results, failures };
  }

  getActivePlugins() {
    return Array.from(this.plugins.entries())
      .filter(([_, plugin]) => plugin.enabled)
      .map(([name, _]) => name);
  }

  getPluginStatus() {
    return Object.fromEntries(
      Array.from(this.plugins.entries()).map(([name, plugin]) => [
        name,
        { enabled: plugin.enabled, name: plugin.constructor.name }
      ])
    );
  }
}

export default PluginManager;
EOF
```

**Step 3: Create plugin service (orchestrator)**

```bash
cat > backend/services/pluginService.js << 'EOF'
import { logger } from '../utils/logger.js';

export class PluginService {
  constructor(pluginManager) {
    this.pluginManager = pluginManager;
  }

  async collectTrends(params = {}) {
    logger.info('PluginService: Collecting trends from all plugins');
    const { results, failures } = await this.pluginManager.fetchFromAllPlugins('fetchTrends', params);

    const allTrends = results.flatMap(r => r.data);
    logger.info(`PluginService: Collected ${allTrends.length} trends from ${results.length} sources`);

    return {
      trends: allTrends,
      sources: results.map(r => r.source),
      failures: failures.length > 0 ? failures : null
    };
  }

  async collectDeals(params = {}) {
    logger.info('PluginService: Collecting deals from all plugins');
    const { results, failures } = await this.pluginManager.fetchFromAllPlugins('fetchDeals', params);

    const allDeals = results.flatMap(r => r.data);
    logger.info(`PluginService: Collected ${allDeals.length} deals from ${results.length} sources`);

    return {
      deals: allDeals,
      sources: results.map(r => r.source),
      failures: failures.length > 0 ? failures : null
    };
  }

  async collectFounders(params = {}) {
    logger.info('PluginService: Collecting founders from all plugins');
    const { results, failures } = await this.pluginManager.fetchFromAllPlugins('fetchFounders', params);

    const allFounders = results.flatMap(r => r.data);
    logger.info(`PluginService: Collected ${allFounders.length} founders from ${results.length} sources`);

    return {
      founders: allFounders,
      sources: results.map(r => r.source),
      failures: failures.length > 0 ? failures : null
    };
  }
}

export default PluginService;
EOF
```

**Step 4: Commit**

```bash
cd backend
git add plugins/basePlugin.js plugins/pluginManager.js services/pluginService.js
git commit -m "feat: create plugin architecture framework with base class and manager"
```

---

### Task 3: Implement GitHub Trends Plugin

**Files:**
- Create: `backend/plugins/githubPlugin.js`

**Step 1: Create GitHub plugin**

```bash
cat > backend/plugins/githubPlugin.js << 'EOF'
import axios from 'axios';
import { BasePlugin } from './basePlugin.js';
import { getCached, setCached } from '../services/cache.js';
import { logger } from '../utils/logger.js';

export class GitHubPlugin extends BasePlugin {
  constructor() {
    super('GitHub');
    this.token = process.env.GITHUB_TOKEN;
    this.enabled = !!this.token;
    this.baseUrl = 'https://api.github.com';
  }

  async fetchTrends(params = {}) {
    const cacheKey = 'github_trends';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('GitHub: Using cached trends');
      return cached;
    }

    try {
      // Get trending repos from past week
      const query = 'stars:>1000 created:>2026-02-13 language:javascript';
      const response = await axios.get(`${this.baseUrl}/search/repositories`, {
        headers: {
          Authorization: `token ${this.token}`,
          Accept: 'application/vnd.github.v3+json'
        },
        params: {
          q: query,
          sort: 'stars',
          order: 'desc',
          per_page: 30
        }
      });

      const trends = response.data.items.map(repo => ({
        id: repo.id,
        name: repo.name,
        category: this._categorizeRepo(repo),
        mention_count: repo.stargazers_count,
        momentum_score: this._calculateMomentum(repo),
        source: 'github',
        data: {
          url: repo.html_url,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          updated_at: repo.updated_at
        }
      }));

      setCached(cacheKey, trends);
      return trends;
    } catch (error) {
      logger.error('GitHub: Error fetching trends', { error: error.message });
      return [];
    }
  }

  async fetchFounders(params = {}) {
    // GitHub doesn't provide founder data directly, return empty
    // In practice, could search for contributor profiles, but limited by API
    return [];
  }

  _categorizeRepo(repo) {
    const keywords = {
      'ai-ml': ['ai', 'ml', 'llm', 'gpt', 'neural', 'tensorflow', 'pytorch', 'langchain'],
      'web3-crypto': ['blockchain', 'crypto', 'web3', 'ethereum', 'solana', 'smart-contract'],
      'fintech': ['fintech', 'payment', 'trading', 'crypto', 'defi', 'banking'],
      'climate': ['climate', 'green', 'energy', 'sustainability', 'carbon'],
      'cybersecurity': ['security', 'crypto', 'encryption', 'auth', 'penetration'],
      'healthcare': ['health', 'medical', 'biotech', 'healthcare', 'telemedicine'],
      'saas': ['saas', 'cms', 'productivity', 'collaboration', 'analytics']
    };

    const text = (repo.name + ' ' + (repo.description || '')).toLowerCase();

    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => text.includes(word))) {
        return category;
      }
    }
    return 'other';
  }

  _calculateMomentum(repo) {
    // Simple momentum calculation based on stars and recent activity
    const starsScore = Math.min(repo.stargazers_count / 100, 50);
    const recentScore = (repo.forks_count / repo.stargazers_count) * 25;
    return Math.min(starsScore + recentScore + 20, 100);
  }
}

export default GitHubPlugin;
EOF
```

**Step 2: Update server.js to load GitHub plugin**

```bash
# Backup and update server.js
cat > backend/server.js << 'EOF'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { PluginManager } from './plugins/pluginManager.js';
import { PluginService } from './services/pluginService.js';
import { GitHubPlugin } from './plugins/githubPlugin.js';
import { logger } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize plugin system
const pluginManager = new PluginManager();
pluginManager.registerPlugin('github', new GitHubPlugin());

const pluginService = new PluginService(pluginManager);

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API status endpoint
app.get('/api/api-status', (req, res) => {
  res.json({
    apis: pluginManager.getPluginStatus(),
    activePlugins: pluginManager.getActivePlugins()
  });
});

// Trends endpoint
app.get('/api/trends', async (req, res) => {
  try {
    const result = await pluginService.collectTrends();
    res.json(result);
  } catch (error) {
    logger.error('Error in /api/trends', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Deals endpoint (placeholder for now)
app.get('/api/deals', (req, res) => {
  res.json({ deals: [], message: 'Deals endpoint not yet implemented' });
});

// Founders endpoint (placeholder for now)
app.get('/api/founders', (req, res) => {
  res.json({ founders: [], message: 'Founders endpoint not yet implemented' });
});

app.listen(PORT, () => {
  logger.info(`VC Intelligence Hub backend running on http://localhost:${PORT}`);
  logger.info(`Active plugins: ${pluginManager.getActivePlugins().join(', ')}`);
});
EOF
```

**Step 3: Test GitHub plugin**

```bash
npm run dev
# In another terminal:
curl http://localhost:5000/api/trends
curl http://localhost:5000/api/api-status
```

Expected: Returns trends from GitHub (if token provided) or empty array with failure info

**Step 4: Commit**

```bash
git add plugins/githubPlugin.js server.js
git commit -m "feat: implement GitHub trends plugin with momentum calculation"
```

---

### Task 4: Implement Twitter Trends Plugin

**Files:**
- Create: `backend/plugins/twitterPlugin.js`

**Step 1: Create Twitter plugin**

```bash
cat > backend/plugins/twitterPlugin.js << 'EOF'
import axios from 'axios';
import { BasePlugin } from './basePlugin.js';
import { getCached, setCached } from '../services/cache.js';
import { logger } from '../utils/logger.js';

export class TwitterPlugin extends BasePlugin {
  constructor() {
    super('Twitter');
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN;
    this.enabled = !!this.bearerToken;
    this.baseUrl = 'https://api.twitter.com/2';
  }

  async fetchTrends(params = {}) {
    const cacheKey = 'twitter_trends';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('Twitter: Using cached trends');
      return cached;
    }

    try {
      // Search for venture/startup mentions in past 7 days
      const queries = [
        '#AI #startup -is:retweet',
        '#fintech funding -is:retweet',
        '#crypto #blockchain -is:retweet',
        '#climatetech -is:retweet',
        '#healthtech -is:retweet'
      ];

      const allTrends = [];

      for (const query of queries) {
        try {
          const response = await axios.get(`${this.baseUrl}/tweets/search/recent`, {
            headers: {
              Authorization: `Bearer ${this.bearerToken}`
            },
            params: {
              query: query,
              max_results: 100,
              tweet_fields: 'public_metrics,created_at'
            }
          });

          if (response.data.data) {
            const trends = response.data.data.map(tweet => ({
              id: tweet.id,
              name: this._extractTrendName(tweet.text),
              category: this._categorizeTweet(tweet.text),
              mention_count: tweet.public_metrics.like_count + tweet.public_metrics.retweet_count,
              momentum_score: this._calculateMomentum(tweet.public_metrics),
              source: 'twitter',
              data: {
                text: tweet.text,
                likes: tweet.public_metrics.like_count,
                retweets: tweet.public_metrics.retweet_count,
                created_at: tweet.created_at
              }
            }));
            allTrends.push(...trends);
          }
        } catch (error) {
          logger.warn(`Twitter: Error with query "${query}"`, { error: error.message });
        }
      }

      // Deduplicate and sort by momentum
      const unique = Array.from(new Map(allTrends.map(t => [t.name, t])).values());
      unique.sort((a, b) => b.momentum_score - a.momentum_score);

      setCached(cacheKey, unique.slice(0, 50));
      return unique.slice(0, 50);
    } catch (error) {
      logger.error('Twitter: Error fetching trends', { error: error.message });
      return [];
    }
  }

  async fetchDeals(params = {}) {
    // Search for funding announcements
    const cacheKey = 'twitter_deals';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('Twitter: Using cached deals');
      return cached;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/tweets/search/recent`, {
        headers: {
          Authorization: `Bearer ${this.bearerToken}`
        },
        params: {
          query: '(funding OR "Series A" OR "Series B" OR investment) -is:retweet',
          max_results: 100,
          tweet_fields: 'public_metrics,created_at'
        }
      });

      const deals = (response.data.data || []).map(tweet => ({
        id: tweet.id,
        company_name: this._extractCompanyName(tweet.text),
        funding_type: this._extractFundingType(tweet.text),
        source: 'twitter',
        data: {
          text: tweet.text,
          engagement: tweet.public_metrics.like_count + tweet.public_metrics.retweet_count,
          created_at: tweet.created_at
        }
      }));

      setCached(cacheKey, deals);
      return deals;
    } catch (error) {
      logger.error('Twitter: Error fetching deals', { error: error.message });
      return [];
    }
  }

  _extractTrendName(text) {
    // Extract hashtags or key words
    const hashtags = text.match(/#\w+/g) || [];
    if (hashtags.length > 0) return hashtags[0].substring(1);

    const words = text.split(' ').filter(w => w.length > 3);
    return words[0] || 'trend';
  }

  _extractCompanyName(text) {
    // Simple extraction - look for capitalized words
    const words = text.split(' ');
    return words.find(w => w[0] === w[0].toUpperCase() && w.length > 2) || 'Unknown';
  }

  _extractFundingType(text) {
    if (text.includes('Series A')) return 'Series A';
    if (text.includes('Series B')) return 'Series B';
    if (text.includes('Series C')) return 'Series C';
    if (text.includes('Seed')) return 'Seed';
    return 'Funding';
  }

  _categorizeTweet(text) {
    const categories = {
      'ai-ml': ['#ai', '#ml', '#llm', '#gpt'],
      'fintech': ['#fintech', '#payments', '#trading'],
      'web3-crypto': ['#crypto', '#blockchain', '#web3'],
      'climate': ['#climatetech', '#green', '#sustainability'],
      'healthcare': ['#healthtech', '#biotech', '#healthcare']
    };

    const lower = text.toLowerCase();
    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some(kw => lower.includes(kw))) return cat;
    }
    return 'other';
  }

  _calculateMomentum(metrics) {
    const likes = Math.min(metrics.like_count / 10, 40);
    const retweets = Math.min(metrics.retweet_count / 5, 40);
    const replies = Math.min(metrics.reply_count / 3, 20);
    return Math.min(likes + retweets + replies, 100);
  }
}

export default TwitterPlugin;
EOF
```

**Step 2: Update server.js to load Twitter plugin**

```bash
# Update server.js imports and plugin registration
cat > backend/server.js << 'EOF'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { PluginManager } from './plugins/pluginManager.js';
import { PluginService } from './services/pluginService.js';
import { GitHubPlugin } from './plugins/githubPlugin.js';
import { TwitterPlugin } from './plugins/twitterPlugin.js';
import { logger } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize plugin system
const pluginManager = new PluginManager();
pluginManager.registerPlugin('github', new GitHubPlugin());
pluginManager.registerPlugin('twitter', new TwitterPlugin());

const pluginService = new PluginService(pluginManager);

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API status endpoint
app.get('/api/api-status', (req, res) => {
  res.json({
    apis: pluginManager.getPluginStatus(),
    activePlugins: pluginManager.getActivePlugins()
  });
});

// Trends endpoint
app.get('/api/trends', async (req, res) => {
  try {
    const result = await pluginService.collectTrends();
    res.json(result);
  } catch (error) {
    logger.error('Error in /api/trends', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Deals endpoint
app.get('/api/deals', async (req, res) => {
  try {
    const result = await pluginService.collectDeals();
    res.json(result);
  } catch (error) {
    logger.error('Error in /api/deals', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Founders endpoint (placeholder)
app.get('/api/founders', (req, res) => {
  res.json({ founders: [], message: 'Founders endpoint not yet implemented' });
});

app.listen(PORT, () => {
  logger.info(`VC Intelligence Hub backend running on http://localhost:${PORT}`);
  logger.info(`Active plugins: ${pluginManager.getActivePlugins().join(', ')}`);
});
EOF
```

**Step 3: Test Twitter plugin**

```bash
npm run dev
# In another terminal:
curl http://localhost:5000/api/trends
curl http://localhost:5000/api/deals
```

**Step 4: Commit**

```bash
git add plugins/twitterPlugin.js server.js
git commit -m "feat: implement Twitter trends and deals plugin with momentum calculation"
```

---

### Task 5: Implement NewsAPI Plugin

**Files:**
- Create: `backend/plugins/newsapiPlugin.js`

**Step 1: Create NewsAPI plugin**

```bash
cat > backend/plugins/newsapiPlugin.js << 'EOF'
import axios from 'axios';
import { BasePlugin } from './basePlugin.js';
import { getCached, setCached } from '../services/cache.js';
import { logger } from '../utils/logger.js';

export class NewsAPIPlugin extends BasePlugin {
  constructor() {
    super('NewsAPI');
    this.apiKey = process.env.NEWSAPI_KEY;
    this.enabled = !!this.apiKey;
    this.baseUrl = 'https://newsapi.org/v2';
  }

  async fetchTrends(params = {}) {
    const cacheKey = 'newsapi_trends';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('NewsAPI: Using cached trends');
      return cached;
    }

    try {
      const keywords = ['AI', 'fintech', 'blockchain', 'biotech', 'climate tech'];
      const allTrends = [];

      for (const keyword of keywords) {
        try {
          const response = await axios.get(`${this.baseUrl}/everything`, {
            params: {
              q: keyword,
              sortBy: 'popularity',
              language: 'en',
              pageSize: 20,
              apiKey: this.apiKey
            }
          });

          if (response.data.articles) {
            const trends = response.data.articles.map(article => ({
              id: article.url,
              name: keyword,
              category: this._categorizeKeyword(keyword),
              mention_count: article.urlsToImage ? 1 : 0,
              momentum_score: this._calculateMomentum(article),
              source: 'newsapi',
              data: {
                title: article.title,
                description: article.description,
                url: article.url,
                source: article.source.name,
                publishedAt: article.publishedAt,
                image: article.urlsToImage
              }
            }));
            allTrends.push(...trends);
          }
        } catch (error) {
          logger.warn(`NewsAPI: Error fetching "${keyword}"`, { error: error.message });
        }
      }

      setCached(cacheKey, allTrends.slice(0, 50));
      return allTrends.slice(0, 50);
    } catch (error) {
      logger.error('NewsAPI: Error fetching trends', { error: error.message });
      return [];
    }
  }

  async fetchDeals(params = {}) {
    const cacheKey = 'newsapi_deals';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('NewsAPI: Using cached deals');
      return cached;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/everything`, {
        params: {
          q: '(funding OR "Series A" OR "acquisition" OR "IPO" OR "investment") startup',
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: 50,
          apiKey: this.apiKey
        }
      });

      const deals = (response.data.articles || []).map(article => ({
        id: article.url,
        company_name: this._extractCompanyName(article.title),
        funding_type: this._extractFundingType(article.title),
        source: 'newsapi',
        data: {
          title: article.title,
          description: article.description,
          url: article.url,
          source: article.source.name,
          publishedAt: article.publishedAt
        }
      }));

      setCached(cacheKey, deals);
      return deals;
    } catch (error) {
      logger.error('NewsAPI: Error fetching deals', { error: error.message });
      return [];
    }
  }

  _categorizeKeyword(keyword) {
    const mapping = {
      'AI': 'ai-ml',
      'fintech': 'fintech',
      'blockchain': 'web3-crypto',
      'biotech': 'healthcare',
      'climate tech': 'climate'
    };
    return mapping[keyword] || 'other';
  }

  _extractCompanyName(title) {
    const words = title.split(' ');
    return words[0] || 'Unknown';
  }

  _extractFundingType(title) {
    if (title.includes('Series A')) return 'Series A';
    if (title.includes('Series B')) return 'Series B';
    if (title.includes('acquisition')) return 'Acquisition';
    if (title.includes('IPO')) return 'IPO';
    return 'Funding';
  }

  _calculateMomentum(article) {
    // Simple score based on article relevance and recency
    const age = new Date() - new Date(article.publishedAt);
    const daysOld = age / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(100 - daysOld * 5, 20);
    return recencyScore;
  }
}

export default NewsAPIPlugin;
EOF
```

**Step 2: Update server.js to load NewsAPI plugin**

```bash
# Update imports to include NewsAPIPlugin
sed -i '' "s/import { TwitterPlugin } from/import { NewsAPIPlugin } from '.\/plugins\/newsapiPlugin.js';\nimport { TwitterPlugin } from/" backend/server.js
# Register plugin after Twitter
sed -i '' "s/pluginManager.registerPlugin('twitter', new TwitterPlugin());/pluginManager.registerPlugin('twitter', new TwitterPlugin());\npluginManager.registerPlugin('newsapi', new NewsAPIPlugin());/" backend/server.js
```

Or manually update server.js imports:

```bash
cat > backend/server.js << 'EOF'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { PluginManager } from './plugins/pluginManager.js';
import { PluginService } from './services/pluginService.js';
import { GitHubPlugin } from './plugins/githubPlugin.js';
import { TwitterPlugin } from './plugins/twitterPlugin.js';
import { NewsAPIPlugin } from './plugins/newsapiPlugin.js';
import { logger } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize plugin system
const pluginManager = new PluginManager();
pluginManager.registerPlugin('github', new GitHubPlugin());
pluginManager.registerPlugin('twitter', new TwitterPlugin());
pluginManager.registerPlugin('newsapi', new NewsAPIPlugin());

const pluginService = new PluginService(pluginManager);

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API status endpoint
app.get('/api/api-status', (req, res) => {
  res.json({
    apis: pluginManager.getPluginStatus(),
    activePlugins: pluginManager.getActivePlugins()
  });
});

// Trends endpoint
app.get('/api/trends', async (req, res) => {
  try {
    const result = await pluginService.collectTrends();
    res.json(result);
  } catch (error) {
    logger.error('Error in /api/trends', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Deals endpoint
app.get('/api/deals', async (req, res) => {
  try {
    const result = await pluginService.collectDeals();
    res.json(result);
  } catch (error) {
    logger.error('Error in /api/deals', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Founders endpoint (placeholder)
app.get('/api/founders', (req, res) => {
  res.json({ founders: [], message: 'Founders endpoint not yet implemented' });
});

app.listen(PORT, () => {
  logger.info(`VC Intelligence Hub backend running on http://localhost:${PORT}`);
  logger.info(`Active plugins: ${pluginManager.getActivePlugins().join(', ')}`);
});
EOF
```

**Step 3: Test NewsAPI plugin**

```bash
npm run dev
# In another terminal:
curl http://localhost:5000/api/trends
```

**Step 4: Commit**

```bash
git add plugins/newsapiPlugin.js server.js
git commit -m "feat: implement NewsAPI trends and deals plugin"
```

---

## PHASE 2: Deal Scoring & Trend Analysis Engine

### Task 6: Implement Trend Scoring Algorithm

**Files:**
- Create: `backend/services/trendScoringService.js`

**Step 1: Create trend scoring service**

```bash
mkdir -p backend/services
cat > backend/services/trendScoringService.js << 'EOF'
import { logger } from '../utils/logger.js';

export class TrendScoringService {
  /**
   * Score trends with momentum calculation
   * Scoring breakdown:
   * - Mention velocity (0-30 pts): How fast mentions growing
   * - Source diversity (0-20 pts): Number of different sources
   * - Funding signals (0-25 pts): Associated funding
   * - Founder prominence (0-15 pts): Known founders involved
   * - Recency (0-10 pts): Recent mentions weighted higher
   */
  scoreTrends(trendsList) {
    logger.info('TrendScoringService: Scoring trends', { count: trendsList.length });

    const scoredTrends = trendsList.map(trend => {
      const score = this.calculateMomentumScore(trend);
      return {
        ...trend,
        momentum_score: score,
        lifecycle: this.getTrendLifecycle(score),
        confidence: this.calculateConfidence(trend)
      };
    });

    // Sort by momentum score descending
    scoredTrends.sort((a, b) => b.momentum_score - a.momentum_score);

    logger.info('TrendScoringService: Scoring complete', {
      topTrend: scoredTrends[0]?.name,
      topScore: scoredTrends[0]?.momentum_score
    });

    return scoredTrends;
  }

  calculateMomentumScore(trend) {
    let score = 0;

    // Mention velocity (0-30 pts)
    const velocityScore = Math.min(trend.mention_count / 100, 30);
    score += velocityScore;

    // Source diversity (0-20 pts) - reward if mentioned in multiple sources
    const sourceDiversity = trend.sources ? Math.min(trend.sources.length * 4, 20) : 0;
    score += sourceDiversity;

    // Funding signals (0-25 pts) - check for Series A/B/C mentions
    const fundingScore = this.calculateFundingScore(trend);
    score += fundingScore;

    // Founder prominence (0-15 pts) - serial entrepreneurs
    const founderScore = this.calculateFounderScore(trend);
    score += founderScore;

    // Recency (0-10 pts)
    const recencyScore = this.calculateRecencyScore(trend);
    score += recencyScore;

    return Math.min(Math.round(score), 100);
  }

  calculateFundingScore(trend) {
    if (!trend.data || typeof trend.data !== 'object') return 0;

    const text = JSON.stringify(trend.data).toLowerCase();
    let score = 0;

    if (text.includes('series a') || text.includes('seed')) score += 8;
    if (text.includes('series b')) score += 12;
    if (text.includes('series c')) score += 15;
    if (text.includes('acquisition')) score += 20;
    if (text.includes('ipo')) score += 25;

    return Math.min(score, 25);
  }

  calculateFounderScore(trend) {
    if (!trend.data || typeof trend.data !== 'object') return 0;

    const text = JSON.stringify(trend.data).toLowerCase();
    const keywords = ['founder', 'ceo', 'serial entrepreneur', 'exit', 'previous startup'];

    let score = 0;
    keywords.forEach(keyword => {
      if (text.includes(keyword)) score += 3;
    });

    return Math.min(score, 15);
  }

  calculateRecencyScore(trend) {
    // If trend has timestamp, score based on age
    let age = 0;

    if (trend.data && trend.data.created_at) {
      const trendDate = new Date(trend.data.created_at);
      const now = new Date();
      age = (now - trendDate) / (1000 * 60 * 60); // hours
    }

    // Recent trends (< 24 hours) get full score
    if (age < 24) return 10;
    // Decay by 0.5 points per day
    return Math.max(10 - (age / 24) * 0.5, 2);
  }

  getTrendLifecycle(score) {
    if (score >= 70) return 'peak';
    if (score >= 50) return 'emerging';
    if (score >= 40) return 'established';
    return 'declining';
  }

  calculateConfidence(trend) {
    // Confidence based on number of sources and consistency
    const sources = trend.sources ? trend.sources.length : 1;
    const confidenceMap = {
      1: 'low',
      2: 'medium',
      3: 'high',
      4: 'high',
      5: 'very-high'
    };
    return confidenceMap[Math.min(sources, 5)];
  }

  deduplicateTrends(trends) {
    const seen = new Map();

    trends.forEach(trend => {
      const key = trend.name.toLowerCase();

      if (seen.has(key)) {
        const existing = seen.get(key);
        // Merge sources
        existing.sources = [...new Set([...(existing.sources || []), ...(trend.sources || [])])];
        // Average mention count
        existing.mention_count = (existing.mention_count + trend.mention_count) / 2;
      } else {
        seen.set(key, trend);
      }
    });

    return Array.from(seen.values());
  }
}

export default TrendScoringService;
EOF
```

**Step 2: Create endpoint to get scored trends**

```bash
# Update server.js to use TrendScoringService
cat >> backend/server.js << 'EOF'

import { TrendScoringService } from './services/trendScoringService.js';

const trendScoringService = new TrendScoringService();

// Scored trends endpoint
app.get('/api/trends/scored', async (req, res) => {
  try {
    const { trends } = await pluginService.collectTrends();
    const deduplicated = trendScoringService.deduplicateTrends(trends);
    const scored = trendScoringService.scoreTrends(deduplicated);

    res.json({
      trends: scored,
      count: scored.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in /api/trends/scored', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});
EOF
```

**Step 3: Test trend scoring**

```bash
npm run dev
# In another terminal:
curl http://localhost:5000/api/trends/scored
```

Expected: Returns trends with momentum scores, sorted by score descending

**Step 4: Commit**

```bash
git add services/trendScoringService.js server.js
git commit -m "feat: implement trend scoring algorithm with momentum calculation"
```

---

### Task 7: Create Frontend Project Structure

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/main.jsx`
- Create: `frontend/src/App.jsx`
- Create: `frontend/src/index.css`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`

**Step 1: Initialize frontend**

```bash
cd ..
mkdir -p frontend/src
cd frontend

cat > package.json << 'EOF'
{
  "name": "vc-intelligence-hub-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.10.3"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "tailwindcss": "^3.3.6",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}
EOF
```

**Step 2: Create Vite config**

```bash
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
EOF
```

**Step 3: Create index.html**

```bash
cat > index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VC Intelligence Hub</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF
```

**Step 4: Create main.jsx**

```bash
cat > src/main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF
```

**Step 5: Create Tailwind config**

```bash
cat > tailwind.config.js << 'EOF'
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0f172a',
          800: '#1a1f35',
        },
        trend: {
          'ai-ml': '#6366f1',
          'fintech': '#ec4899',
          'climate': '#10b981',
          'healthcare': '#ef4444',
          'cybersecurity': '#8b5cf6',
          'web3-crypto': '#f97316',
          'saas': '#06b6d4',
          'robotics': '#14b8a6',
          'creator': '#d946ef',
          'other': '#f59e0b',
        }
      },
      fontFamily: {
        'display': ['Space Grotesk', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
EOF
```

**Step 6: Create postcss.config.js**

```bash
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
```

**Step 7: Create global CSS**

```bash
cat > src/index.css << 'EOF'
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  @apply m-0 p-0 box-border;
}

body {
  @apply bg-dark-900 text-gray-100;
  font-family: 'Inter', sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Space Grotesk', sans-serif;
}

.card {
  @apply bg-dark-800 rounded-lg border border-gray-700 p-5 transition-all hover:shadow-lg hover:shadow-gray-900/50;
}

.card-header {
  @apply font-display font-bold text-lg mb-4;
}

.trend-badge {
  @apply inline-block px-3 py-1 rounded-full text-sm font-semibold;
}
EOF
```

**Step 8: Create basic App component**

```bash
cat > src/App.jsx << 'EOF'
import { useState, useEffect } from 'react'

function App() {
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apis, setApis] = useState({})

  useEffect(() => {
    fetchApiStatus()
  }, [])

  const fetchApiStatus = async () => {
    try {
      const response = await fetch('/api/api-status')
      const data = await response.json()
      setApis(data.apis)
    } catch (err) {
      console.error('Error fetching API status:', err)
    }
  }

  const fetchTrends = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/trends/scored')
      const data = await response.json()
      setTrends(data.trends || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <header className="border-b border-gray-700 bg-dark-800 py-6 px-8">
        <h1 className="text-4xl font-display font-bold mb-2">VC Intelligence Hub</h1>
        <p className="text-gray-400">Real-time trend analysis for venture capital</p>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="mb-8 flex gap-4 items-center">
          <button
            onClick={fetchTrends}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Fetch Trends'}
          </button>

          <div className="flex gap-2">
            {Object.entries(apis).map(([name, config]) => (
              <div
                key={name}
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  config.enabled ? 'bg-green-900 text-green-100' : 'bg-gray-700 text-gray-300'
                }`}
              >
                {config.name}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6 text-red-100">
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trends.map((trend) => (
            <div key={trend.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display font-bold text-xl">{trend.name}</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">{trend.momentum_score}</div>
                  <div className="text-xs text-gray-400">{trend.lifecycle}</div>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-3">
                Category: <span className="font-semibold capitalize">{trend.category}</span>
              </p>

              <div className="flex gap-2 flex-wrap">
                {trend.sources?.map((source) => (
                  <span key={source} className="text-xs bg-gray-700 px-2 py-1 rounded">
                    {source}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {trends.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400">
            <p>No trends loaded. Click "Fetch Trends" to get started.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
EOF
```

**Step 9: Install dependencies**

```bash
npm install
```

**Step 10: Test frontend**

```bash
npm run dev
```

Expected: Frontend starts on http://localhost:5173

**Step 11: Commit**

```bash
cd ..
git add frontend/
git commit -m "feat: initialize React frontend with Vite and Tailwind"
```

---

## Summary

This implementation plan spans **7 major tasks** across backend and frontend:

**Phase 1 (Backend Infrastructure):**
1. Backend project setup with Express
2. Plugin architecture framework
3. GitHub trends plugin
4. Twitter trends plugin
5. NewsAPI plugin

**Phase 2 (Analysis Engine & Frontend):**
6. Trend scoring algorithm
7. React frontend initialization

**Remaining work (to continue in next batch):**
- AngelList plugin
- Serper plugin
- Founder extraction service
- Deal scoring service
- TrendsFeed component
- TrendDrilldown component
- DealDiscovery component
- FounderNetwork graph component
- Integration & deployment

---

**Plan Status:** Ready for execution

---
