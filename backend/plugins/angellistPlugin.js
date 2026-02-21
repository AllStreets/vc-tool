import axios from 'axios';
import { BasePlugin } from './basePlugin.js';
import { getCached, setCached } from '../services/cache.js';
import { logger } from '../utils/logger.js';

export class AngelListPlugin extends BasePlugin {
  constructor() {
    super('AngelList');
    this.apiKey = process.env.ANGELLIST_API_KEY;
    this.enabled = !!this.apiKey;
    this.baseUrl = 'https://api.angel.co/v1';
  }

  async fetchDeals(params = {}) {
    if (!this.enabled) {
      logger.warn('AngelList: API key not configured');
      return [];
    }

    const cacheKey = 'angellist_deals';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('AngelList: Using cached deals');
      return cached;
    }

    try {
      // Get recent funding rounds
      const response = await axios.get(`${this.baseUrl}/startups`, {
        params: {
          api_token: this.apiKey,
          filter: 'fundraising',
          per_page: 50
        }
      });

      const deals = (response.data.startups || []).map(startup => ({
        id: startup.id,
        company_name: startup.name,
        funding_type: this._extractFundingType(startup),
        source: 'angellist',
        data: {
          description: startup.tagline,
          url: startup.company_url,
          founded: startup.founded_at,
          total_raised: startup.total_raised,
          stage: startup.stage,
          locations: startup.locations?.map(l => l.name) || [],
          tags: startup.markets?.map(m => m.name) || []
        }
      }));

      setCached(cacheKey, deals);
      logger.info('AngelList: Fetched deals', { count: deals.length });
      return deals;
    } catch (error) {
      logger.error('AngelList: Error fetching deals', { error: error.message });
      return [];
    }
  }

  async fetchFounders(params = {}) {
    if (!this.enabled) {
      logger.warn('AngelList: API key not configured');
      return [];
    }

    const cacheKey = 'angellist_founders';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('AngelList: Using cached founders');
      return cached;
    }

    try {
      // Get founder profiles
      const response = await axios.get(`${this.baseUrl}/users`, {
        params: {
          api_token: this.apiKey,
          type: 'founder',
          per_page: 100
        }
      });

      const founders = (response.data.users || []).map(user => ({
        id: user.id,
        name: user.name,
        title: user.investor_title || 'Founder',
        source: 'angellist',
        data: {
          bio: user.bio,
          location: user.locations?.map(l => l.name) || [],
          expertise: user.markets?.map(m => m.name) || [],
          twitter: user.twitter_url,
          angel_list_url: user.angel_list_url,
          investor_type: user.investor_type,
          investments_count: user.investments_count
        }
      }));

      setCached(cacheKey, founders);
      logger.info('AngelList: Fetched founders', { count: founders.length });
      return founders;
    } catch (error) {
      logger.error('AngelList: Error fetching founders', { error: error.message });
      return [];
    }
  }

  _extractFundingType(startup) {
    if (!startup.stage) return 'Funding';
    const stage = startup.stage.toLowerCase();
    if (stage.includes('seed')) return 'Seed';
    if (stage.includes('series a')) return 'Series A';
    if (stage.includes('series b')) return 'Series B';
    if (stage.includes('series c')) return 'Series C';
    if (stage.includes('growth')) return 'Growth Round';
    return 'Funding';
  }
}

export default AngelListPlugin;
