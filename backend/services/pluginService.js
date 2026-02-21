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
