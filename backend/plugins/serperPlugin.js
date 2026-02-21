import axios from 'axios';
import { BasePlugin } from './basePlugin.js';
import { getCached, setCached } from '../services/cache.js';
import { logger } from '../utils/logger.js';

export class SerperPlugin extends BasePlugin {
  constructor() {
    super('Serper');
    this.apiKey = process.env.SERPER_API_KEY;
    this.enabled = true; // Always enabled - gracefully handles missing API key
    this.baseUrl = 'https://google.serper.dev';
  }

  async fetchTrends(params = {}) {
    const cacheKey = 'serper_trends';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('Serper: Using cached trends');
      return cached;
    }

    try {
      const queries = [
        'AI startup funding 2026',
        'fintech innovation news',
        'blockchain venture capital',
        'climate tech companies',
        'healthcare technology trends',
        'cybersecurity startup',
        'SaaS company launch'
      ];

      const allTrends = [];

      for (const query of queries) {
        try {
          const response = await axios.post(
            `${this.baseUrl}/search`,
            { q: query, num: 10 },
            {
              headers: {
                'X-API-KEY': this.apiKey,
                'Content-Type': 'application/json'
              },
              timeout: 5000
            }
          );

          if (response.data.organic) {
            const trends = response.data.organic.map((result, index) => ({
              id: result.link || `serper-${query}-${index}`,
              name: this._extractTrendName(result.title),
              category: this._categorizeQuery(query),
              mention_count: 1,
              momentum_score: this._calculateMomentum(result, index),
              source: 'serper',
              sources: ['serper'],
              data: {
                title: result.title,
                description: result.snippet,
                url: result.link,
                position: result.position
              }
            }));
            allTrends.push(...trends);
          }
        } catch (error) {
          logger.warn(`Serper: Error with query "${query}"`, { error: error.message });
        }
      }

      // Deduplicate by title
      const unique = Array.from(new Map(allTrends.map(t => [t.name, t])).values());
      const sliced = unique.slice(0, 50);

      setCached(cacheKey, sliced);
      return sliced;
    } catch (error) {
      logger.error('Serper: Error fetching trends', { error: error.message });
      return [];
    }
  }

  async fetchDeals(params = {}) {
    const cacheKey = 'serper_deals';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('Serper: Using cached deals');
      return cached;
    }

    try {
      const queries = [
        'startup funding announcement',
        'venture capital investment',
        'Series A B C funding rounds',
        'M&A technology companies',
        'IPO news 2026'
      ];

      const allDeals = [];

      for (const query of queries) {
        try {
          const response = await axios.post(
            `${this.baseUrl}/search`,
            { q: query, num: 15 },
            {
              headers: {
                'X-API-KEY': this.apiKey,
                'Content-Type': 'application/json'
              },
              timeout: 5000
            }
          );

          if (response.data.organic) {
            const deals = response.data.organic.map((result, index) => ({
              id: result.link || `serper-deal-${query}-${index}`,
              company_name: this._extractCompanyName(result.title),
              funding_type: this._extractFundingType(result.title),
              source: 'serper',
              data: {
                title: result.title,
                description: result.snippet,
                url: result.link,
                position: result.position
              }
            }));
            allDeals.push(...deals);
          }
        } catch (error) {
          logger.warn(`Serper: Error with deal query "${query}"`, { error: error.message });
        }
      }

      setCached(cacheKey, allDeals);
      return allDeals;
    } catch (error) {
      logger.error('Serper: Error fetching deals', { error: error.message });
      return [];
    }
  }

  _extractTrendName(title) {
    return title.substring(0, 50);
  }

  _extractCompanyName(title) {
    const words = title.split(' ');
    return words.find(w => w[0] === w[0].toUpperCase() && w.length > 2) || 'Unknown';
  }

  _extractFundingType(title) {
    const lower = title.toLowerCase();
    if (lower.includes('series a') || lower.includes('seed')) return 'Seed/Series A';
    if (lower.includes('series b')) return 'Series B';
    if (lower.includes('series c')) return 'Series C';
    if (lower.includes('acquisition') || lower.includes('acquired')) return 'Acquisition';
    if (lower.includes('ipo')) return 'IPO';
    if (lower.includes('funding') || lower.includes('investment')) return 'Funding Round';
    return 'Investment';
  }

  _categorizeQuery(query) {
    const lower = query.toLowerCase();
    if (lower.includes('ai') || lower.includes('artificial intelligence')) return 'ai-ml';
    if (lower.includes('fintech') || lower.includes('finance')) return 'fintech';
    if (lower.includes('blockchain') || lower.includes('crypto')) return 'web3-crypto';
    if (lower.includes('climate') || lower.includes('green')) return 'climate';
    if (lower.includes('health') || lower.includes('biotech')) return 'healthcare';
    if (lower.includes('cyber') || lower.includes('security')) return 'cybersecurity';
    if (lower.includes('saas') || lower.includes('software')) return 'saas';
    return 'other';
  }

  _calculateMomentum(result, position) {
    // Higher position (lower number) = higher momentum
    const positionScore = Math.max(100 - (position * 10), 20);
    return Math.min(positionScore, 100);
  }
}

export default SerperPlugin;
