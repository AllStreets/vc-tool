// Plugin configuration - controls which API sources are active
export const PLUGIN_CONFIG = {
  github: {
    enabled: !!process.env.GITHUB_TOKEN,
    name: 'GitHub Trends',
    methods: ['fetchTrends', 'fetchFounders']
  },
  newsapi: {
    enabled: !!process.env.NEWSAPI_KEY,
    name: 'News API',
    methods: ['fetchTrends', 'fetchDeals']
  },
  serper: {
    enabled: !!process.env.SERPER_API_KEY,
    name: 'Serper Search',
    methods: ['fetchTrends', 'fetchDeals']
  },
  hackerNews: {
    enabled: process.env.HACKER_NEWS_ENABLED === 'true',
    name: 'Hacker News',
    methods: ['fetchTrends', 'fetchFounders']
  },
  ycScraper: {
    enabled: process.env.YC_SCRAPER_ENABLED === 'true',
    name: 'Y Combinator',
    methods: ['fetchDeals', 'fetchFounders']
  },
  secEdgar: {
    enabled: process.env.SEC_EDGAR_ENABLED === 'true',
    name: 'SEC EDGAR',
    methods: ['fetchDeals']
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
      { enabled: config.enabled, name: config.name }
    ])
  );
};
