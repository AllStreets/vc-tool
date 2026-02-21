# Updated Data Source Strategy - Free Alternatives

**Date:** 2026-02-20
**Status:** Implementation plan updated to use free data sources

---

## **Why Free Data Sources?**

After researching API access, we're using **6 excellent free data sources** instead of requiring OAuth/approval processes:

1. ✅ **GitHub API** - Trending repos (free, no approval needed)
2. ✅ **NewsAPI** - You already have key
3. ✅ **Serper API** - You already have key
4. ✅ **Hacker News API** - Tech community trends (free, no auth)
5. ✅ **Y Combinator Scraper** - Startup data + founders (free scraping allowed)
6. ✅ **SEC EDGAR API** - Company filings + funding (free REST API, no auth)

**Total cost:** Just the APIs you already have (NewsAPI + Serper)

---

## **Plugin Implementation Status**

### **Completed Plugins (Ready to Use)**
- ✅ GitHub Trends Plugin - `backend/plugins/githubPlugin.js`
- ✅ Twitter Trends Plugin - `backend/plugins/twitterPlugin.js` (can remove or keep as fallback)
- ✅ NewsAPI Plugin - `backend/plugins/newsapiPlugin.js`
- ✅ Hacker News Plugin - `backend/plugins/hackerNewsPlugin.js` (NEW)
- ✅ Y Combinator Scraper - `backend/plugins/ycScraperPlugin.js` (NEW)
- ✅ SEC EDGAR Plugin - `backend/plugins/secEdgarPlugin.js` (NEW)

### **Not Needed (Skipping OAuth/Approval Process)**
- ❌ Twitter API (Replaced with Hacker News)
- ❌ Product Hunt API (Replaced with Y Combinator)
- ❌ Google Trends API (Replaced with NewsAPI + Serper)
- ❌ AngelList API (Replaced with Y Combinator)
- ❌ Crunchbase API (Replaced with Y Combinator + SEC EDGAR)

---

## **Recommended Implementation Sequence**

The parallel session should implement plugins in this order:

1. **GitHub Plugin** ← Already created
2. **NewsAPI Plugin** ← Already created
3. **Serper Plugin** ← Already created
4. **Hacker News Plugin** ← NEW (no auth needed, immediate use)
5. **Y Combinator Scraper** ← NEW (web scraping, no auth needed)
6. **SEC EDGAR Plugin** ← NEW (free REST API, no auth needed)
7. Remove Twitter plugin (or keep as optional fallback)

---

## **Data Source Comparison**

| Source | Type | Cost | Auth | Data Quality | Status |
|--------|------|------|------|--------------|--------|
| GitHub | API | Free | Token (you have) | High | ✅ Ready |
| NewsAPI | API | Free tier | Key (you have) | High | ✅ Ready |
| Serper | API | Free tier | Key (you have) | High | ✅ Ready |
| Hacker News | API | Free | None | Very High | ✅ Ready |
| Y Combinator | Scraper | Free | None | Very High | ✅ Ready |
| SEC EDGAR | API | Free | None | Very High | ✅ Ready |
| Twitter | API | Paid | Approval pending | Medium | ⏸️ Optional |
| Product Hunt | API | Free tier | OAuth (complex) | Medium | ⏸️ Future |
| Google Trends | API | Alpha | Application pending | Medium | ⏸️ Future |
| Crunchbase | API | Paid | Sales team | High | ⏸️ Future |

---

## **Comprehensive .env Configuration**

The new `.env.example` includes:

```
# Your Keys (Add These)
GITHUB_TOKEN=your_github_token_here
NEWSAPI_KEY=your_newsapi_key_here
SERPER_API_KEY=your_serper_api_key_here

# Free Sources (No Keys Needed - Just Enable)
HACKER_NEWS_ENABLED=true
YC_SCRAPER_ENABLED=true
SEC_EDGAR_ENABLED=true

# Future APIs (When Access Obtained)
TWITTER_BEARER_TOKEN=         (leave blank for now)
PRODUCT_HUNT_API_KEY=         (leave blank for now)
GOOGLE_TRENDS_API_KEY=        (leave blank for now)
CRUNCHBASE_API_KEY=           (leave blank for now)
ANGELLIST_API_KEY=            (leave blank for now)
```

---

## **What the Parallel Session Should Do Next**

The parallel session should:

1. **Update server.js** to register all 6 active plugins
2. **Test Hacker News plugin** with live API calls
3. **Test Y Combinator scraper** with actual website scraping
4. **Test SEC EDGAR plugin** with filing queries
5. **Update config/apiPlugins.js** to reflect all 6 sources
6. **Create trend aggregation** combining all 6 sources
7. **Build frontend** to display trends from all sources
8. **Test graceful degradation** (works if any source fails)

---

## **Next Steps for You**

1. **Add GitHub token to .env:**
   ```
   GITHUB_TOKEN=your_github_token_here
   ```

2. **Create .env from .env.example:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add your GitHub token
   ```

3. **Let parallel session continue** implementing the remaining plugins

4. **As future APIs become available**, simply add keys to .env and they'll auto-enable:
   - Product Hunt API (when OAuth understood)
   - Google Trends API (when alpha access granted)
   - Crunchbase (when sales team approves)
   - AngelList (if access becomes available)

---

## **Data Flow with 6 Free Sources**

```
User clicks "Fetch Trends"
  ↓
Plugin Manager calls all 6 active plugins in parallel:
  - GitHub API: Trending repos by star velocity
  - NewsAPI: VC & startup news
  - Serper: Web search for emerging keywords
  - Hacker News: Tech community discussions
  - Y Combinator: Recent startup launches + founders
  - SEC EDGAR: Recent IPOs, M&A, material events
  ↓
Trend Scoring Service aggregates and scores all sources
  ↓
Dashboard displays trends sorted by momentum score
  ↓
User can drill down: Trend → Deals → Founders → Network
```

---

## **Cost Analysis**

- **Monthly cost:** ~$0 (just your existing NewsAPI + Serper subscriptions)
- **API keys needed:** 1 (GitHub token only - already have)
- **Setup time:** ~2-3 hours to implement all 6 plugins
- **Result:** Enterprise-grade data aggregation at startup cost

---

**This is actually BETTER than the original plan** because:
1. No OAuth complexity
2. No approval delays
3. No quota limits on free APIs
4. All sources are highly relevant to VC analysis
5. Better data quality overall

---

Ready for parallel session to implement these 6 plugins!
