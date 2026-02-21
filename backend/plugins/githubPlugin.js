import axios from 'axios';
import { BasePlugin } from './basePlugin.js';
import { getCached, setCached } from '../services/cache.js';
import { logger } from '../utils/logger.js';

export class GitHubPlugin extends BasePlugin {
  constructor() {
    super('GitHub');
    this.token = process.env.GITHUB_TOKEN;
    this.enabled = true; // Always enabled - gracefully handles missing API key
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
      // Search for trending repos created in the last week
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const dateStr = sevenDaysAgo.toISOString().split('T')[0];

      const query = `created:>${dateStr} stars:>100 language:javascript language:typescript language:python`;

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
        },
        timeout: 5000
      });

      const trends = response.data.items.map(repo => ({
        id: `github-${repo.id}`,
        name: repo.name,
        category: this._categorizeRepo(repo),
        mention_count: repo.stargazers_count,
        momentum_score: this._calculateMomentum(repo),
        source: 'github',
        sources: ['github'],
        data: {
          url: repo.html_url,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          watchers: repo.watchers_count,
          updated_at: repo.updated_at,
          created_at: repo.created_at,
          owner: repo.owner.login
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
    // GitHub provides contributor data but limited founder info
    // Return empty as we extract founders from other sources
    return [];
  }

  _categorizeRepo(repo) {
    const keywords = {
      'ai-ml': ['ai', 'ml', 'llm', 'gpt', 'neural', 'tensorflow', 'pytorch', 'langchain', 'agent', 'transformer'],
      'web3-crypto': ['blockchain', 'crypto', 'web3', 'ethereum', 'solana', 'smart-contract', 'defi', 'nft'],
      'fintech': ['fintech', 'payment', 'trading', 'defi', 'banking', 'wallet', 'stock'],
      'climate': ['climate', 'green', 'energy', 'sustainability', 'carbon', 'renewable', 'solar', 'wind'],
      'cybersecurity': ['security', 'encryption', 'auth', 'penetration', 'defender', 'attack', 'vulnerability'],
      'healthcare': ['health', 'medical', 'biotech', 'telemedicine', 'pharma', 'diagnosis'],
      'saas': ['saas', 'cms', 'productivity', 'collaboration', 'analytics', 'crm', 'erp']
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
    // Momentum based on stars, forks, and recent activity
    const starsScore = Math.min(repo.stargazers_count / 50, 40);
    const forksScore = Math.min(repo.forks_count / 10, 25);
    const watchersScore = Math.min(repo.watchers_count / 30, 15);

    // Check recency
    const updatedDate = new Date(repo.updated_at);
    const now = new Date();
    const ageHours = (now - updatedDate) / (1000 * 60 * 60);
    const recencyScore = ageHours < 24 ? 20 : ageHours < 168 ? 10 : 5;

    const total = starsScore + forksScore + watchersScore + recencyScore;
    return Math.min(Math.round(total), 100);
  }
}

export default GitHubPlugin;
