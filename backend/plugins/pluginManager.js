import { BasePlugin } from './basePlugin.js';
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
