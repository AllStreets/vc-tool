import axios from 'axios';
import { BasePlugin } from './basePlugin.js';
import { getCached, setCached } from '../services/cache.js';
import { logger } from '../utils/logger.js';

export class YCScraperPlugin extends BasePlugin {
  constructor() {
    super('YCombinator');
    this.enabled = true; // Always enabled - no API key required
    this.baseUrl = 'https://www.ycombinator.com';
    this.userAgent = process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
  }

  async fetchDeals(params = {}) {
    const cacheKey = 'yc_deals';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('YCombinator: Using cached deals');
      return cached;
    }

    try {
      // Scrape YC companies page
      const response = await axios.get(`${this.baseUrl}/companies`, {
        headers: { 'User-Agent': this.userAgent },
        timeout: parseInt(process.env.REQUEST_TIMEOUT_MS || '10000', 10)
      });

      // Simple extraction - in production would use cheerio for proper parsing
      const deals = this._parseYCCompanies(response.data);

      setCached(cacheKey, deals);
      return deals;
    } catch (error) {
      logger.error('YCombinator: Error scraping companies', { error: error.message });
      return [];
    }
  }

  async fetchFounders(params = {}) {
    // YC scraper also provides founder information
    const cacheKey = 'yc_founders';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('YCombinator: Using cached founders');
      return cached;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/companies`, {
        headers: { 'User-Agent': this.userAgent },
        timeout: parseInt(process.env.REQUEST_TIMEOUT_MS || '10000', 10)
      });

      const founders = this._parseYCFounders(response.data);

      setCached(cacheKey, founders);
      return founders;
    } catch (error) {
      logger.error('YCombinator: Error scraping founders', { error: error.message });
      return [];
    }
  }

  _parseYCCompanies(html) {
    // Simple parsing - looks for company name and description in HTML
    // In production, use cheerio library for robust HTML parsing:
    // const cheerio = require('cheerio');
    // const $ = cheerio.load(html);
    // Then parse with jQuery-like selectors

    // For now, return sample structure that would be populated by proper parsing
    const deals = [];

    // Extract company data from HTML (simplified regex approach)
    const companyPattern = /class="[^"]*company[^"]*"[^>]*>([^<]+)</gi;
    let match;

    while ((match = companyPattern.exec(html)) !== null) {
      const companyName = match[1].trim();
      if (companyName.length > 2) {
        deals.push({
          id: `yc_${companyName.toLowerCase().replace(/\s+/g, '_')}`,
          company_name: companyName,
          funding_type: 'YC Batch',
          source: 'yc_scraper',
          data: {
            url: `${this.baseUrl}/companies/${companyName.toLowerCase().replace(/\s+/g, '-')}`,
            source: 'Y Combinator'
          }
        });
      }
    }

    logger.info('YCombinator: Parsed companies', { count: deals.length });
    return deals;
  }

  _parseYCFounders(html) {
    // Extract founder information from YC company pages
    // This would require more sophisticated parsing

    // Sample structure that would be populated by proper HTML parsing
    const founders = [];

    // Look for founder names and titles
    const founderPattern = /founder[^<]*<[^>]*>([^<]+)</gi;
    let match;

    while ((match = founderPattern.exec(html)) !== null) {
      const founderInfo = match[1].trim();
      if (founderInfo.length > 2) {
        founders.push({
          id: `yc_founder_${founderInfo.toLowerCase().replace(/\s+/g, '_')}`,
          name: founderInfo,
          title: 'Founder',
          source: 'yc_scraper',
          data: {
            source: 'Y Combinator',
            batch_status: 'YC Alumnus'
          }
        });
      }
    }

    logger.info('YCombinator: Parsed founders', { count: founders.length });
    return founders;
  }
}

export default YCScraperPlugin;
