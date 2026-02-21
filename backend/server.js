import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { PluginManager } from './plugins/pluginManager.js';
import { PluginService } from './services/pluginService.js';
import { TrendScoringService } from './services/trendScoringService.js';
import { GitHubPlugin } from './plugins/githubPlugin.js';
import { HackerNewsPlugin } from './plugins/hackerNewsPlugin.js';
import { NewsAPIPlugin } from './plugins/newsapiPlugin.js';
import { SerperPlugin } from './plugins/serperPlugin.js';
import { YCScraperPlugin } from './plugins/ycScraperPlugin.js';
import { SECEdgarPlugin } from './plugins/secEdgarPlugin.js';
import { AngelListPlugin } from './plugins/angellistPlugin.js';
import { logger } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize plugin system
const pluginManager = new PluginManager();

// Register primary data sources (activate with API keys)
pluginManager.registerPlugin('github', new GitHubPlugin());
pluginManager.registerPlugin('newsapi', new NewsAPIPlugin());
pluginManager.registerPlugin('serper', new SerperPlugin());

// Register free plugins (no API key needed)
pluginManager.registerPlugin('hackernews', new HackerNewsPlugin());
pluginManager.registerPlugin('yc_scraper', new YCScraperPlugin());
pluginManager.registerPlugin('sec_edgar', new SECEdgarPlugin());

// Register future plugins (will activate when API keys available)
pluginManager.registerPlugin('angellist', new AngelListPlugin());

const pluginService = new PluginService(pluginManager);
const trendScoringService = new TrendScoringService();

app.use(cors());
app.use(express.json());

// ============================================
// HEALTH & STATUS ENDPOINTS
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'VC Intelligence Hub Backend'
  });
});

app.get('/api/api-status', (req, res) => {
  res.json({
    apis: pluginManager.getPluginStatus(),
    activePlugins: pluginManager.getActivePlugins(),
    timestamp: new Date().toISOString()
  });
});

// ============================================
// TRENDS ENDPOINTS
// ============================================

app.get('/api/trends', async (req, res) => {
  try {
    logger.info('GET /api/trends - Collecting raw trends');
    const result = await pluginService.collectTrends();
    res.json(result);
  } catch (error) {
    logger.error('Error in /api/trends', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/trends/scored', async (req, res) => {
  try {
    logger.info('GET /api/trends/scored - Collecting and scoring trends');
    const { trends } = await pluginService.collectTrends();
    const deduplicated = trendScoringService.deduplicateTrends(trends);
    const scored = trendScoringService.scoreTrends(deduplicated);

    res.json({
      trends: scored,
      count: scored.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in /api/trends/scored', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DEALS ENDPOINTS
// ============================================

app.get('/api/deals', async (req, res) => {
  try {
    logger.info('GET /api/deals - Collecting deals');
    const result = await pluginService.collectDeals();
    res.json(result);
  } catch (error) {
    logger.error('Error in /api/deals', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// FOUNDERS ENDPOINTS
// ============================================

app.get('/api/founders', async (req, res) => {
  try {
    logger.info('GET /api/founders - Collecting founders');
    const result = await pluginService.collectFounders();
    res.json(result);
  } catch (error) {
    logger.error('Error in /api/founders', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message });
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// SERVER START
// ============================================

app.listen(PORT, () => {
  logger.info(`VC Intelligence Hub backend running on http://localhost:${PORT}`);
  logger.info(`Active plugins: ${pluginManager.getActivePlugins().join(', ')}`);
  logger.info(`Total registered plugins: ${Object.keys(pluginManager.plugins || {}).length}`);
});

export default app;
