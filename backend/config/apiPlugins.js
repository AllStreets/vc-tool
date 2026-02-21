// Plugin configuration - controls which API sources are active
// Plugins are checked in order and gracefully degrade if disabled

export const PLUGIN_CONFIG = {
  // ============================================
  // PRIMARY DATA SOURCES (You have these)
  // ============================================
  github: {
    enabled: !!process.env.GITHUB_TOKEN,
    name: 'GitHub Trends',
    priority: 'high',
    methods: ['fetchTrends', 'fetchFounders'],
    status: 'ready'
  },
  newsapi: {
    enabled: !!process.env.NEWSAPI_KEY,
    name: 'NewsAPI',
    priority: 'high',
    methods: ['fetchTrends', 'fetchDeals'],
    status: 'ready'
  },
  serper: {
    enabled: !!process.env.SERPER_API_KEY,
    name: 'Serper Search',
    priority: 'high',
    methods: ['fetchTrends', 'fetchDeals'],
    status: 'ready'
  },

  // ============================================
  // FREE SOURCES (No API Key Needed)
  // ============================================
  hackernews: {
    enabled: process.env.HACKER_NEWS_ENABLED === 'true',
    name: 'Hacker News',
    priority: 'high',
    methods: ['fetchTrends', 'fetchDeals'],
    status: 'ready'
  },
  yc_scraper: {
    enabled: process.env.YC_SCRAPER_ENABLED === 'true',
    name: 'Y Combinator',
    priority: 'high',
    methods: ['fetchDeals', 'fetchFounders'],
    status: 'ready'
  },
  sec_edgar: {
    enabled: process.env.SEC_EDGAR_ENABLED === 'true',
    name: 'SEC EDGAR',
    priority: 'medium',
    methods: ['fetchTrends', 'fetchDeals'],
    status: 'ready'
  },

  // ============================================
  // FUTURE SOURCES (Pending Access)
  // ============================================
  twitter: {
    enabled: !!process.env.TWITTER_BEARER_TOKEN,
    name: 'Twitter/X API',
    priority: 'high',
    methods: ['fetchTrends', 'fetchDeals'],
    status: 'awaiting-access',
    note: 'Fallback: Hacker News used if unavailable'
  },
  angellist: {
    enabled: !!process.env.ANGELLIST_API_KEY,
    name: 'AngelList API',
    priority: 'high',
    methods: ['fetchDeals', 'fetchFounders'],
    status: 'awaiting-access',
    note: 'Fallback: Y Combinator + SEC EDGAR used if unavailable'
  }
};

export const getActivePlugins = () => {
  return Object.entries(PLUGIN_CONFIG)
    .filter(([_, config]) => config.enabled)
    .map(([name, config]) => ({ name, ...config }));
};

export const getPluginStatus = () => {
  return Object.fromEntries(
    Object.entries(PLUGIN_CONFIG).map(([name, config]) => [
      name,
      {
        enabled: config.enabled,
        name: config.name,
        status: config.status,
        priority: config.priority,
        note: config.note || null
      }
    ])
  );
};

export const getReadyPlugins = () => {
  return getActivePlugins().filter(p => p.status === 'ready');
};

export const getPendingPlugins = () => {
  return Object.entries(PLUGIN_CONFIG)
    .filter(([_, config]) => !config.enabled && config.status === 'awaiting-access')
    .map(([name, config]) => ({ name, ...config }));
};
