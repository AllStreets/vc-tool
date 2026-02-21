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
    if (!this.enabled) {
      logger.warn('Twitter: API key not configured');
      return [];
    }

    const cacheKey = 'twitter_trends';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('Twitter: Using cached trends');
      return cached;
    }

    try {
      // Search for trending startup and tech discussions
      const keywords = ['startup', 'funding', 'venture capital', 'Series A', 'Series B', 'IPO', 'acquisition'];
      const trends = [];

      for (const keyword of keywords) {
        try {
          const response = await axios.get(`${this.baseUrl}/tweets/search/recent`, {
            headers: {
              'Authorization': `Bearer ${this.bearerToken}`,
            },
            params: {
              query: `${keyword} -is:retweet`,
              max_results: 10,
              'tweet.fields': 'created_at,public_metrics,author_id',
              expansions: 'author_id'
            }
          });

          const tweets = response.data.data || [];
          const includes = response.data.includes || {};
          const authorMap = {};
          (includes.users || []).forEach(user => {
            authorMap[user.id] = user;
          });

          for (const tweet of tweets) {
            const author = authorMap[tweet.author_id] || {};
            trends.push({
              id: tweet.id,
              name: tweet.text.substring(0, 50),
              category: this._categorizeKeyword(keyword),
              mention_count: tweet.public_metrics?.impression_count || 0,
              sources: ['twitter'],
              source: 'twitter',
              data: {
                text: tweet.text,
                author: author.username || 'Unknown',
                author_followers: author.public_metrics?.followers_count || 0,
                created_at: tweet.created_at,
                likes: tweet.public_metrics?.like_count || 0,
                retweets: tweet.public_metrics?.retweet_count || 0,
                url: `https://twitter.com/${author.username}/status/${tweet.id}`
              }
            });
          }
        } catch (err) {
          logger.debug(`Twitter: Error fetching trends for keyword "${keyword}": ${err.message}`);
        }
      }

      setCached(cacheKey, trends);
      return trends;
    } catch (error) {
      logger.error('Twitter: Error fetching trends', { error: error.message });
      return [];
    }
  }

  async fetchDeals(params = {}) {
    if (!this.enabled) {
      logger.warn('Twitter: API key not configured');
      return [];
    }

    const cacheKey = 'twitter_deals';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('Twitter: Using cached deals');
      return cached;
    }

    try {
      // Search for funding announcements and deal discussions
      const response = await axios.get(`${this.baseUrl}/tweets/search/recent`, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
        },
        params: {
          query: '(funding announcement OR Series funding OR acquisition OR IPO) -is:retweet',
          max_results: 25,
          'tweet.fields': 'created_at,public_metrics,author_id',
          expansions: 'author_id'
        }
      });

      const tweets = response.data.data || [];
      const includes = response.data.includes || {};
      const authorMap = {};
      (includes.users || []).forEach(user => {
        authorMap[user.id] = user;
      });

      const deals = tweets.map(tweet => {
        const author = authorMap[tweet.author_id] || {};
        return {
          id: tweet.id,
          company_name: tweet.text.substring(0, 60),
          deal_type: this._extractDealType(tweet.text),
          source: 'twitter',
          data: {
            text: tweet.text,
            author: author.username || 'Unknown',
            author_followers: author.public_metrics?.followers_count || 0,
            created_at: tweet.created_at,
            engagement: {
              likes: tweet.public_metrics?.like_count || 0,
              retweets: tweet.public_metrics?.retweet_count || 0,
              replies: tweet.public_metrics?.reply_count || 0
            },
            url: `https://twitter.com/${author.username}/status/${tweet.id}`
          }
        };
      });

      setCached(cacheKey, deals);
      return deals;
    } catch (error) {
      logger.error('Twitter: Error fetching deals', { error: error.message });
      return [];
    }
  }

  async fetchFounders(params = {}) {
    if (!this.enabled) {
      logger.warn('Twitter: API key not configured');
      return [];
    }

    const cacheKey = 'twitter_founders';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('Twitter: Using cached founders');
      return cached;
    }

    try {
      // Search for founder and entrepreneur discussions
      const response = await axios.get(`${this.baseUrl}/tweets/search/recent`, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
        },
        params: {
          query: '(founder OR startup founder OR serial entrepreneur) -is:retweet',
          max_results: 20,
          'tweet.fields': 'created_at,public_metrics,author_id',
          expansions: 'author_id'
        }
      });

      const tweets = response.data.data || [];
      const includes = response.data.includes || {};
      const authorMap = {};
      (includes.users || []).forEach(user => {
        authorMap[user.id] = user;
      });

      const founders = tweets.map(tweet => {
        const author = authorMap[tweet.author_id] || {};
        return {
          id: tweet.id,
          founder_name: author.name || 'Unknown',
          username: author.username,
          source: 'twitter',
          data: {
            bio: author.description || '',
            followers: author.public_metrics?.followers_count || 0,
            following: author.public_metrics?.following_count || 0,
            tweets: author.public_metrics?.tweet_count || 0,
            verified: author.verified || false,
            latest_tweet: tweet.text,
            tweet_created_at: tweet.created_at,
            url: `https://twitter.com/${author.username}`
          }
        };
      });

      setCached(cacheKey, founders);
      return founders;
    } catch (error) {
      logger.error('Twitter: Error fetching founders', { error: error.message });
      return [];
    }
  }

  _categorizeKeyword(keyword) {
    const categories = {
      'startup': 'saas',
      'funding': 'fintech',
      'venture capital': 'fintech',
      'Series A': 'fintech',
      'Series B': 'fintech',
      'IPO': 'fintech',
      'acquisition': 'fintech'
    };
    return categories[keyword] || 'other';
  }

  _extractDealType(text) {
    if (text.toLowerCase().includes('ipo')) return 'IPO';
    if (text.toLowerCase().includes('acquisition') || text.toLowerCase().includes('acquired')) return 'Acquisition';
    if (text.toLowerCase().includes('series c')) return 'Series C';
    if (text.toLowerCase().includes('series b')) return 'Series B';
    if (text.toLowerCase().includes('series a')) return 'Series A';
    if (text.toLowerCase().includes('seed')) return 'Seed';
    return 'Funding';
  }
}

export default TwitterPlugin;
