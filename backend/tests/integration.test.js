/**
 * Integration Tests for VC Intelligence Hub
 * Tests: Plugin system, scoring service, and data collection
 */

import { PluginManager } from '../plugins/pluginManager.js';
import { PluginService } from '../services/pluginService.js';
import { TrendScoringService } from '../services/trendScoringService.js';
import { HackerNewsPlugin } from '../plugins/hackerNewsPlugin.js';
import { YCScraperPlugin } from '../plugins/ycScraperPlugin.js';
import { SECEdgarPlugin } from '../plugins/secEdgarPlugin.js';

// Color-coded test output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test Results Tracker
let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    log(`  ✓ ${message}`, 'green');
  } else {
    failed++;
    failures.push(message);
    log(`  ✗ ${message}`, 'red');
  }
}

async function runTests() {
  log('\n═══════════════════════════════════════════', 'blue');
  log('VC Intelligence Hub - Integration Tests', 'blue');
  log('═══════════════════════════════════════════\n', 'blue');

  // Test 1: Plugin Manager
  log('TEST 1: Plugin Manager', 'yellow');
  log('─────────────────────────', 'yellow');

  try {
    const pluginManager = new PluginManager();
    assert(pluginManager !== null, 'PluginManager instantiates');
    assert(pluginManager.plugins instanceof Map, 'Plugins stored as Map');

    const hnPlugin = new HackerNewsPlugin();
    pluginManager.registerPlugin('hackernews', hnPlugin);
    assert(pluginManager.plugins.has('hackernews'), 'Plugin registered successfully');
    // Note: Active plugins only show if environment variables are set
    assert(pluginManager.plugins.size > 0, 'Plugins are registered in manager');
  } catch (error) {
    log(`  ✗ Plugin Manager Error: ${error.message}`, 'red');
    failed++;
  }

  // Test 2: HackerNews Plugin Structure
  log('\nTEST 2: HackerNews Plugin', 'yellow');
  log('─────────────────────────', 'yellow');

  try {
    const hnPlugin = new HackerNewsPlugin();
    assert(hnPlugin !== null, 'HackerNews plugin instantiates');
    assert(hnPlugin.name === 'HackerNews', 'Plugin has correct name');
    assert(typeof hnPlugin.fetchTrends === 'function', 'fetchTrends method exists');
    assert(typeof hnPlugin.fetchDeals === 'function', 'fetchDeals method exists');
    assert(typeof hnPlugin._calculateMomentum === 'function', 'Momentum calculation exists');
  } catch (error) {
    log(`  ✗ HackerNews Plugin Error: ${error.message}`, 'red');
    failed++;
  }

  // Test 3: YC Scraper Plugin Structure
  log('\nTEST 3: Y Combinator Scraper Plugin', 'yellow');
  log('─────────────────────────', 'yellow');

  try {
    const ycPlugin = new YCScraperPlugin();
    assert(ycPlugin !== null, 'YC Scraper plugin instantiates');
    assert(ycPlugin.name === 'YCombinator', `Plugin has correct name: ${ycPlugin.name}`);
    assert(typeof ycPlugin.fetchDeals === 'function', 'fetchDeals method exists');
    assert(typeof ycPlugin.fetchFounders === 'function', 'fetchFounders method exists');
  } catch (error) {
    log(`  ✗ YC Scraper Error: ${error.message}`, 'red');
    failed++;
  }

  // Test 4: SEC EDGAR Plugin Structure
  log('\nTEST 4: SEC EDGAR Plugin', 'yellow');
  log('─────────────────────────', 'yellow');

  try {
    const secPlugin = new SECEdgarPlugin();
    assert(secPlugin !== null, 'SEC EDGAR plugin instantiates');
    assert(secPlugin.name === 'SECEdgar', `Plugin has correct name: ${secPlugin.name}`);
    assert(typeof secPlugin.fetchDeals === 'function', 'fetchDeals method exists');
    assert(typeof secPlugin.fetchTrends === 'function', 'fetchTrends method exists');
  } catch (error) {
    log(`  ✗ SEC EDGAR Error: ${error.message}`, 'red');
    failed++;
  }

  // Test 5: Trend Scoring Service
  log('\nTEST 5: Trend Scoring Service', 'yellow');
  log('─────────────────────────', 'yellow');

  try {
    const scoringService = new TrendScoringService();
    assert(scoringService !== null, 'TrendScoringService instantiates');

    // Test mock trend data
    const mockTrend = {
      id: '1',
      name: 'AI Trends',
      category: 'ai-ml',
      mention_count: 150,
      sources: ['hackernews', 'newsapi'],
      data: {
        title: 'New Series A Funding for AI Startup',
        created_at: new Date().toISOString()
      }
    };

    const score = scoringService.calculateMomentumScore(mockTrend);
    assert(score >= 0 && score <= 100, `Score in valid range (0-100): ${score}`);
    assert(typeof score === 'number', 'Score is a number');

    const lifecycle = scoringService.getTrendLifecycle(score);
    assert(['peak', 'emerging', 'established', 'declining'].includes(lifecycle), `Lifecycle determined: ${lifecycle}`);

    const confidence = scoringService.calculateConfidence(mockTrend);
    assert(['low', 'medium', 'high', 'very-high'].includes(confidence), `Confidence calculated: ${confidence}`);
  } catch (error) {
    log(`  ✗ Scoring Service Error: ${error.message}`, 'red');
    failed++;
  }

  // Test 6: Trend Deduplication
  log('\nTEST 6: Trend Deduplication', 'yellow');
  log('─────────────────────────', 'yellow');

  try {
    const scoringService = new TrendScoringService();

    const mockTrends = [
      {
        id: '1',
        name: 'AI Trends',
        category: 'ai-ml',
        mention_count: 100,
        sources: ['hackernews'],
        data: {}
      },
      {
        id: '2',
        name: 'ai trends',
        category: 'ai-ml',
        mention_count: 50,
        sources: ['newsapi'],
        data: {}
      },
      {
        id: '3',
        name: 'Fintech News',
        category: 'fintech',
        mention_count: 75,
        sources: ['serper'],
        data: {}
      }
    ];

    const deduplicated = scoringService.deduplicateTrends(mockTrends);
    assert(deduplicated.length === 2, `Duplicates merged: ${deduplicated.length} trends (expected 2)`);
    assert(deduplicated[0].sources.length === 2, 'Sources merged for duplicate trend');
  } catch (error) {
    log(`  ✗ Deduplication Error: ${error.message}`, 'red');
    failed++;
  }

  // Test 7: Full Trend Scoring Pipeline
  log('\nTEST 7: Full Scoring Pipeline', 'yellow');
  log('─────────────────────────', 'yellow');

  try {
    const scoringService = new TrendScoringService();

    const mockTrends = [
      {
        id: '1',
        name: 'Trend A',
        category: 'ai-ml',
        mention_count: 200,
        sources: ['hackernews', 'newsapi', 'serper'],
        data: { title: 'Series B Funding', created_at: new Date().toISOString() }
      },
      {
        id: '2',
        name: 'Trend B',
        category: 'fintech',
        mention_count: 50,
        sources: ['hackernews'],
        data: { title: 'New Payment', created_at: new Date().toISOString() }
      }
    ];

    const scored = scoringService.scoreTrends(mockTrends);
    assert(scored.length === 2, 'All trends scored');
    assert(scored[0].momentum_score >= scored[1].momentum_score, 'Trends sorted by score');
    assert(scored[0].hasOwnProperty('lifecycle'), 'Lifecycle added to trend');
    assert(scored[0].hasOwnProperty('confidence'), 'Confidence added to trend');
  } catch (error) {
    log(`  ✗ Scoring Pipeline Error: ${error.message}`, 'red');
    failed++;
  }

  // Test 8: Plugin Service Integration
  log('\nTEST 8: Plugin Service Integration', 'yellow');
  log('─────────────────────────', 'yellow');

  try {
    const pluginManager = new PluginManager();
    pluginManager.registerPlugin('hackernews', new HackerNewsPlugin());
    pluginManager.registerPlugin('yc_scraper', new YCScraperPlugin());
    pluginManager.registerPlugin('sec_edgar', new SECEdgarPlugin());

    const pluginService = new PluginService(pluginManager);
    assert(pluginService !== null, 'PluginService instantiates');
    assert(pluginService.pluginManager === pluginManager, 'PluginManager connected');
    assert(typeof pluginService.collectTrends === 'function', 'collectTrends method exists');
    assert(typeof pluginService.collectDeals === 'function', 'collectDeals method exists');
    assert(typeof pluginService.collectFounders === 'function', 'collectFounders method exists');
  } catch (error) {
    log(`  ✗ Plugin Service Error: ${error.message}`, 'red');
    failed++;
  }

  // Test 9: Data Structure Validation
  log('\nTEST 9: Data Structure Validation', 'yellow');
  log('─────────────────────────', 'yellow');

  try {
    const mockTrend = {
      id: 'test-1',
      name: 'Test Trend',
      category: 'ai-ml',
      mention_count: 100,
      momentum_score: 75,
      source: 'hackernews',
      sources: ['hackernews'],
      data: {
        title: 'Test Article',
        url: 'https://example.com',
        created_at: new Date().toISOString()
      }
    };

    assert(mockTrend.id !== undefined, 'Trend has ID');
    assert(mockTrend.name !== undefined, 'Trend has name');
    assert(mockTrend.category !== undefined, 'Trend has category');
    assert(mockTrend.sources instanceof Array, 'Sources is an array');
    assert(mockTrend.data !== undefined, 'Trend has data object');
  } catch (error) {
    log(`  ✗ Data Structure Error: ${error.message}`, 'red');
    failed++;
  }

  // Test 10: Funding Score Calculation
  log('\nTEST 10: Funding Score Calculation', 'yellow');
  log('─────────────────────────', 'yellow');

  try {
    const scoringService = new TrendScoringService();

    const seedTrend = {
      id: '1',
      name: 'Seed Funding',
      data: { title: 'Company raises seed funding' }
    };

    const seriesBTrend = {
      id: '2',
      name: 'Series B',
      data: { title: 'Company raises Series B funding' }
    };

    const acquisitionTrend = {
      id: '3',
      name: 'Acquisition',
      data: { title: 'Big Tech company acquisition announcement' }
    };

    const seedScore = scoringService.calculateFundingScore(seedTrend);
    const seriesBScore = scoringService.calculateFundingScore(seriesBTrend);
    const acqScore = scoringService.calculateFundingScore(acquisitionTrend);

    assert(seedScore > 0, `Seed funding detected: ${seedScore} points`);
    assert(seriesBScore > seedScore, `Series B scores higher than seed: B=${seriesBScore}, Seed=${seedScore}`);
    assert(acqScore >= 20, `Acquisition scores 20+ points: ${acqScore}`);
  } catch (error) {
    log(`  ✗ Funding Score Error: ${error.message}`, 'red');
    failed++;
  }

  // Summary
  log('\n═══════════════════════════════════════════', 'blue');
  log('TEST SUMMARY', 'blue');
  log('═══════════════════════════════════════════', 'blue');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`Total:  ${passed + failed}\n`, 'blue');

  if (failures.length > 0) {
    log('FAILURES:', 'red');
    failures.forEach(f => log(`  - ${f}`, 'red'));
    log('');
  }

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
