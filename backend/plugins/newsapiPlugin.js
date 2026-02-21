import axios from 'axios';
import { BasePlugin } from './basePlugin.js';
import { getCached, setCached } from '../services/cache.js';
import { logger } from '../utils/logger.js';

export class NewsAPIPlugin extends BasePlugin {
  constructor() {
    super('NewsAPI');
    this.apiKey = process.env.NEWSAPI_KEY;
    this.enabled = true; // Always enabled - gracefully handles missing API key
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
      const keywords = ['AI startup', 'fintech funding', 'blockchain venture', 'biotech innovation', 'climate tech'];
      const allTrends = [];

      for (const keyword of keywords) {
        try {
          const response = await axios.get(`${this.baseUrl}/everything`, {
            params: {
              q: keyword,
              sortBy: 'popularity',
              language: 'en',
              pageSize: 15,
              apiKey: this.apiKey
            },
            timeout: 5000
          });

          if (response.data.articles) {
            const trends = response.data.articles.map(article => ({
              id: article.url || article.title,
              name: this._extractTrendName(article.title),
              category: this._categorizeKeyword(keyword),
              mention_count: 1,
              momentum_score: this._calculateMomentum(article),
              source: 'newsapi',
              sources: ['newsapi'],
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

      // Deduplicate by title
      const unique = Array.from(new Map(allTrends.map(t => [t.name, t])).values());
      const sliced = unique.slice(0, 50);

      setCached(cacheKey, sliced);
      return sliced;
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
          q: '(funding OR "Series A" OR "Series B" OR acquisition OR IPO) startup',
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: 50,
          apiKey: this.apiKey
        },
        timeout: 5000
      });

      const deals = (response.data.articles || []).map(article => ({
        id: article.url || article.title,
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

  _extractTrendName(title) {
    const words = title.split(' ').filter(w => w.length > 3);
    return words.slice(0, 3).join(' ') || title.substring(0, 30);
  }

  _extractCompanyName(title) {
    const words = title.split(' ');
    return words.find(w => w[0] === w[0].toUpperCase() && w.length > 2) || 'Unknown Company';
  }

  _extractFundingType(title) {
    const lower = title.toLowerCase();
    if (lower.includes('series a') || lower.includes('seed')) return 'Seed/Series A';
    if (lower.includes('series b')) return 'Series B';
    if (lower.includes('series c')) return 'Series C';
    if (lower.includes('acquisition')) return 'Acquisition';
    if (lower.includes('ipo')) return 'IPO';
    return 'Funding';
  }

  _categorizeKeyword(keyword) {
    const lower = keyword.toLowerCase();
    if (lower.includes('ai') || lower.includes('ml')) return 'ai-ml';
    if (lower.includes('fintech')) return 'fintech';
    if (lower.includes('blockchain') || lower.includes('crypto')) return 'web3-crypto';
    if (lower.includes('biotech')) return 'healthcare';
    if (lower.includes('climate')) return 'climate';
    return 'other';
  }

  _calculateMomentum(article) {
    // Score based on recency and article prominence
    const publishedDate = new Date(article.publishedAt);
    const now = new Date();
    const ageHours = (now - publishedDate) / (1000 * 60 * 60);

    // Recent articles (< 24 hours) get higher score
    if (ageHours < 1) return 85;
    if (ageHours < 6) return 75;
    if (ageHours < 24) return 65;
    if (ageHours < 72) return 50;
    return Math.max(40 - (ageHours / 24) * 2, 20);
  }
}

export default NewsAPIPlugin;
