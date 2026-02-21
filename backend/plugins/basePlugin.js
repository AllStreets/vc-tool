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
