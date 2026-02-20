# VC Intelligence Hub Design

**Date:** 2026-02-20
**Feature:** Build a trend-first intelligence platform for VCs to discover emerging opportunities and build founder networks
**Goal:** Create an innovative portfolio project that demonstrates market analysis thinking, full-stack architecture, and modular API design for VC job applications

---

## Overview

The VC Intelligence Hub is a real-time intelligence platform that helps venture capitalists identify emerging market trends, surface relevant startup deals, and map founder relationship networks. By aggregating signals from GitHub, Twitter, News APIs, AngelList, and Serper, the platform enables VCs to move from macro trend discovery → specific deals → founder networks in a seamless workflow.

The tool demonstrates:
- Trend analysis and momentum scoring algorithms
- Full-stack architecture with graceful API degradation
- Modular plugin-based data integration
- Cost-conscious design (freemium APIs, efficient caching)
- Professional UI/UX design (dark theme, interconnected data visualization)

---

## Current State vs. Target State

**Current State:** New greenfield project (repository created but empty)

**Target State:**
- VC Intelligence Hub MVP deployed and running
- Trends engine aggregating from 5 data sources (GitHub, Twitter, News, AngelList, Serper)
- Deal sourcing surfacing funding announcements linked to trends
- Founder network graph showing relationship mappings
- Graceful API degradation (works with any subset of APIs active)
- Plugin architecture for easy API source additions
- Professional dark theme UI with trend categorization
- Cost-effective operation ($50-100/month)
- GitHub repository with clean commit history

---

## Architecture & Data Model

### Backend Architecture

**API Integration Strategy (Plugin-Based):**
- Modular plugin system: Each data source (GitHub, Twitter, AngelList, etc.) is independent
- Plugin interface: Each plugin provides `fetchTrends()`, `fetchDeals()`, `fetchFounders()` methods
- Configuration: `config/apiPlugins.js` lists active plugins; frontend detects which are enabled
- Graceful degradation: If a plugin fails, system continues with other sources
- Easy extensibility: Adding new API source = adding new plugin file, no refactoring

**Data Collection Pipeline (Every 2-4 hours):**
1. GitHub plugin: Track rising repos by star velocity, languages, frameworks
2. Twitter plugin: Monitor #tech #venture #startup mentions, founder activity
3. News plugin: Scrape TechCrunch, VentureBeat for funding announcements
4. AngelList plugin: Pull startup data, funding rounds, founder profiles
5. Serper plugin: Web search for emerging topics and mentions

**Caching Strategy (Cost Control):**
- Raw API responses cached for 4 hours (reduces API calls by 90%)
- Trend re-scoring every hour (lightweight computation, no API calls)
- Only call APIs when cache expires
- Archive trends/deals older than 30 days
- PostgreSQL stores all historical data

### Trend Detection Algorithm

**Trend Scoring (0-100 momentum score):**
- Mention velocity (0-30 pts): How fast mentions growing across sources
- Source diversity (0-20 pts): Number of different sources mentioning it (max 5 sources)
- Funding signals (0-25 pts): Associated funding announcements, investor activity
- Founder prominence (0-15 pts): Involvement of known/serial entrepreneurs
- Recency (0-10 pts): Recent mentions weighted higher

**Trend Lifecycle:**
- Emerging: 40-59 score (shown in feed)
- Peak: 70+ score (highlighted, high priority)
- Declining: <40 score (archived)
- Persistent: 50+ for 2+ weeks (featured)

### Deal Sourcing Logic

**Deal Detection (Priority-Ranked):**
1. Acquisition by trending tech (Priority 0 - highest)
2. Funding announcements in trending spaces (Priority 1)
3. Series A/B/C raises (Priority 1)
4. M&A activity (Priority 2)
5. New startup launches/demo days (Priority 3)

**Deal Scoring (Relevance):**
- Trend alignment (0-50 pts)
- Funding size (0-20 pts)
- Founder quality (0-15 pts)
- Market size (0-15 pts)

### Founder Network Graph

**Network Nodes:**
- Founder profile (name, title, track record, social presence)
- Investment history
- Co-founder relationships
- Trending involvement (color-coded by category)
- Investor connections

**Relationship Types:**
- Co-founder (direct link)
- Investor-Founder (directed edge)
- Collaborator (GitHub commits)
- Mentioned together (news articles, Twitter)

### Data Model

**Trends Table:**
- id, name, category, momentum_score, mention_count, source_breakdown, created_at, updated_at, archived_at

**Deals Table:**
- id, company_name, funding_type, amount, founders[], related_trends[], created_at, announced_at

**Founders Table:**
- id, name, email, twitter_handle, github_profile, track_record, trending_involvement, created_at, updated_at

**Founder_Relationships Table:**
- id, founder_1_id, founder_2_id, relationship_type, confidence_score, created_at

---

## Frontend Architecture

**Component Structure:**
1. **App.jsx** - Main container, API source status management
2. **TrendsFeed.jsx** - Hero trends list with sorting/filtering
3. **TrendDrilldown.jsx** - Right sidebar showing trend details
4. **DealDiscovery.jsx** - Funding announcements linked to trends
5. **FounderNetwork.jsx** - Interactive graph visualization
6. **APISourceIndicators.jsx** - Status of each data source with toggle
7. **Charts.jsx** - Recharts for trend momentum visualization
8. **TrendTimeline.jsx** - 30-day trend evolution chart

**Data Flow:**
```
User clicks trend in feed
  ↓
TrendDrilldown loads related deals + founders
  ↓
Shows founder network for that trend
  ↓
User can click deal to see full context
  ↓
User can explore founder relationships
```

**Responsive Design:**
- Desktop: Trends feed (60%) + right panel (40%)
- Tablet: Stacked with collapsible sections
- Mobile: Trends primary, swipe for panels

---

## Color-Coded Trend Categories (10 Total)

| Category | Hex Color | Use |
|----------|-----------|-----|
| AI/ML | #6366f1 (Indigo) | Machine learning, LLMs, generative AI |
| Fintech | #ec4899 (Pink) | Financial services, payments, trading |
| Climate | #10b981 (Emerald) | Climate tech, green energy, sustainability |
| Healthcare/Biotech | #ef4444 (Red) | Healthcare, biotech, medical devices |
| Cybersecurity | #8b5cf6 (Purple) | Security, zero-trust, threat detection |
| Web3/Crypto | #f97316 (Orange) | Blockchain, crypto, decentralized apps |
| SaaS | #06b6d4 (Cyan) | Software-as-a-service, productivity |
| Robotics/Hardware | #14b8a6 (Teal) | Robotics, hardware, manufacturing |
| Creator Economy | #d946ef (Magenta) | Content creation, creator tools, platforms |
| Other | #f59e0b (Amber) | Miscellaneous trends |

---

## Visual Design System

**Dark Premium Aesthetic:**
- Background: #0f172a (very dark slate)
- Text primary: #f1f5f9 (off-white)
- Text secondary: #cbd5e1 (light gray)
- Borders: rgba(255,255,255,0.1)
- Cards: #1a1f35 (dark slate with elevation)

**Typography:**
- Headers: Space Grotesk or similar geometric sans-serif
- Body: Inter or similar clean sans-serif

**Spacing & Layout:**
- Max width: 1400px container
- Card padding: 20px
- Gap between sections: 24px
- Sidebar width: 40% (adjustable)

**Interactive Elements:**
- Hover: Subtle glow, slight lift effect
- Click: Highlight animation
- Active trend: Category color accent bar on left
- Loading: Skeleton screens
- Success: Toast notification

---

## API Cost Management

**Freemium Strategy:**
- GitHub API: Free (60 req/hr unauthenticated, 5000 req/hr authenticated)
- AngelList API: Free tier available
- Twitter API: $100/month (developer account)
- NewsAPI: $100/month (professional plan)
- Serper: $100/month (web search API)
- **Total initial: $300/month** (can reduce by using free tiers)

**Cost Optimization:**
- 4-hour caching reduces API calls by 90%
- Only re-score trends hourly (no API calls)
- Archive old data to reduce query time
- Batch requests where possible
- Can downgrade APIs if usage low

**Scaling:**
- Add paid APIs (Crunchbase, PitchBook) after MVP proves value
- Implement tiered API quality (free tiers first, paid fallbacks)

---

## Implementation Phases

### Phase 1: Backend Infrastructure & API Plugins
- Set up Node.js/Express server
- Create plugin architecture framework
- Implement GitHub trends plugin
- Implement Twitter trends plugin
- Set up PostgreSQL database schema
- Implement caching layer
- Create API status endpoint

### Phase 2: Deal Sourcing & Founder Data
- Implement News API plugin
- Implement AngelList plugin
- Implement Serper plugin
- Build deal detection algorithm
- Build founder extraction logic
- Create deal scoring system

### Phase 3: Frontend & Visualization
- Build Trends Feed component
- Build Trend Drilldown panel
- Build Deal Discovery section
- Build Founder Network graph
- Implement API source indicators
- Add Recharts visualizations

### Phase 4: Integration & Polish
- Connect frontend to all backend endpoints
- Implement graceful API degradation
- Add error handling and fallbacks
- Test with all APIs active and disabled
- Dark theme polish
- Responsive design testing

### Phase 5: Deployment & Documentation
- Deploy backend (Railway)
- Deploy frontend (Vercel)
- Push to GitHub
- Write README and API documentation

---

## Success Criteria

✅ **Technical:**
- Trends engine scores and ranks trends in real-time
- Deal detection links deals to relevant trends
- Founder network graph displays 50+ founder relationships
- Graceful degradation: Works with any subset of APIs
- Plugin architecture: Easy to add new API sources
- Caching reduces API costs by 80%+
- Load time < 2 seconds for trends feed

✅ **UX:**
- Analyst can discover trends → deals → founders in <2 minutes
- Dashboard feels organized and professional
- Color system creates clear visual hierarchy
- Interactive elements (hover, click, filter) work smoothly
- All text readable with good contrast

✅ **Portfolio Impact:**
- Demonstrates full-stack architecture thinking
- Shows API integration mastery
- Displays trend analysis algorithm knowledge
- Proves cost-conscious thinking
- Modular design shows software engineering discipline
- Ready for portfolio/interview presentation

---

**Plan Status:** Ready for implementation

---
