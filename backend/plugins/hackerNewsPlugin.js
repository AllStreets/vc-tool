import axios from 'axios';
import { BasePlugin } from './basePlugin.js';
import { getCached, setCached } from '../services/cache.js';
import { logger } from '../utils/logger.js';

export class HackerNewsPlugin extends BasePlugin {
  constructor() {
    super('HackerNews');
    this.enabled = process.env.HACKER_NEWS_ENABLED === 'true';
    this.baseUrl = 'https://hacker-news.firebaseio.com/v0';
  }

  async fetchTrends(params = {}) {
    const cacheKey = 'hackernews_trends';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('HackerNews: Using cached trends');
      return cached;
    }

    try {
      // Get top stories from Hacker News
      const response = await axios.get(`${this.baseUrl}/topstories.json`);
      const storyIds = response.data.slice(0, 30);

      const trends = [];

      for (const id of storyIds.slice(0, 20)) {
        try {
          const storyResponse = await axios.get(`${this.baseUrl}/item/${id}.json`);
          const story = storyResponse.data;

          if (story && story.title) {
            trends.push({
              id: story.id,
              name: this._extractTrendName(story.title),
              category: this._categorizeStory(story.title),
              mention_count: story.score || 0,
              momentum_score: this._calculateMomentum(story),
              source: 'hackernews',
              data: {
                title: story.title,
                url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
                score: story.score,
                comments: story.descendants || 0,
                time: new Date(story.time * 1000).toISOString()
              }
            });
          }
        } catch (error) {
          logger.warn(`HackerNews: Error fetching story ${id}`, { error: error.message });
        }
      }

      setCached(cacheKey, trends);
      return trends;
    } catch (error) {
      logger.error('HackerNews: Error fetching trends', { error: error.message });
      return [];
    }
  }

  async fetchDeals(params = {}) {
    // Search for funding/startup related discussions
    const cacheKey = 'hackernews_deals';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('HackerNews: Using cached deals');
      return cached;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/topstories.json`);
      const storyIds = response.data.slice(0, 50);

      const deals = [];
      const keywords = ['funding', 'series a', 'series b', 'acquisition', 'startup', 'raise', 'investment'];

      for (const id of storyIds.slice(0, 25)) {
        try {
          const storyResponse = await axios.get(`${this.baseUrl}/item/${id}.json`);
          const story = storyResponse.data;

          if (story && story.title && keywords.some(kw => story.title.toLowerCase().includes(kw))) {
            deals.push({
              id: story.id,
              company_name: this._extractCompanyName(story.title),
              funding_type: this._extractFundingType(story.title),
              source: 'hackernews',
              data: {
                title: story.title,
                url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
                score: story.score,
                comments: story.descendants || 0,
                time: new Date(story.time * 1000).toISOString()
              }
            });
          }
        } catch (error) {
          logger.warn(`HackerNews: Error processing story ${id}`, { error: error.message });
        }
      }

      setCached(cacheKey, deals);
      return deals;
    } catch (error) {
      logger.error('HackerNews: Error fetching deals', { error: error.message });
      return [];
    }
  }

  _extractTrendName(title) {
    const words = title.split(' ').filter(w => w.length > 3);
    return words[0] || title;
  }

  _extractCompanyName(title) {
    const words = title.split(' ');
    return words.find(w => w[0] === w[0].toUpperCase() && w.length > 2) || 'Unknown';
  }

  _extractFundingType(title) {
    if (title.includes('Series A')) return 'Series A';
    if (title.includes('Series B')) return 'Series B';
    if (title.includes('Series C')) return 'Series C';
    if (title.includes('acquisition')) return 'Acquisition';
    if (title.includes('raise')) return 'Funding Round';
    return 'Investment';
  }

  _categorizeStory(title) {
    const lower = title.toLowerCase();
    const categories = {
      'ai-ml': ['ai', 'ml', 'llm', 'gpt', 'neural', 'machine learning'],
      'fintech': ['fintech', 'payment', 'crypto', 'trading'],
      'web3-crypto': ['blockchain', 'crypto', 'web3', 'ethereum'],
      'healthcare': ['health', 'biotech', 'medical'],
      'climate': ['climate', 'green', 'energy', 'sustainability'],
      'cybersecurity': ['security', 'encryption', 'penetration'],
      'saas': ['saas', 'startup', 'cloud']
    };

    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some(kw => lower.includes(kw))) return cat;
    }
    return 'other';
  }

  _calculateMomentum(story) {
    const scorePoints = Math.min(story.score / 5, 50);
    const commentPoints = Math.min((story.descendants || 0) / 10, 30);
    const recencyPoints = this._getRecencyScore(story.time);

    return Math.min(Math.round(scorePoints + commentPoints + recencyPoints), 100);
  }

  _getRecencyScore(timestamp) {
    const age = (Date.now() / 1000 - timestamp) / 3600; // hours
    if (age < 1) return 20;
    if (age < 6) return 15;
    if (age < 24) return 10;
    return Math.max(10 - (age / 24) * 2, 2);
  }
}

export default HackerNewsPlugin;
