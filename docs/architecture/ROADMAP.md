# Community Monitor - Development Roadmap

This roadmap outlines the development phases for building the Multi-Platform Community Monitoring System with AI-powered engagement analysis.

---

## ✅ Phase 0: Multi-Platform Refactor (COMPLETED)

### 0.1 Database Schema Refactor
- [x] Refactor schema to be platform-agnostic
- [x] Rename tables: `monitored_subreddits` → `monitored_sources`, `processed_posts` → `processed_content`
- [x] Add `platform` column and platform-specific constraints
- [x] Add JSONB fields for flexible platform configurations
- [x] Create backward compatibility SQL views
- [x] Write migration script: `20250113000001_refactor_to_multi_platform.sql`

### 0.2 TypeScript Type System
- [x] Create platform-agnostic type definitions
- [x] Add `Platform` enum type
- [x] Define platform-specific configuration types
- [x] Create helper functions for platform-specific labels
- [x] Add backward compatibility types with deprecation warnings

### 0.3 Documentation
- [x] Update database schema documentation
- [x] Create multi-platform architecture guide
- [x] Document platform-specific implementations
- [x] Update roadmap for multi-platform support

---

## Phase 1: Database Foundation (1-2 days)

### 1.1 Supabase Setup
- [x] Create Supabase project
- [x] Implement multi-platform database schema:
  - `monitored_sources` table (platform-agnostic)
  - `processed_content` table (platform-agnostic)
  - `ai_analysis` table (unchanged)
  - `notifications` table (unchanged)
- [x] Configure Row Level Security (RLS) policies
- [x] Enable Realtime on `ai_analysis` table
- [x] Set up database indexes for performance
- [x] Create migration files
- [ ] Test database operations and queries across platforms

---

## Phase 2: Frontend Dashboard (2-3 days)

### 2.1 Project Setup
- [x] Set up React + Vite + TypeScript project
- [x] Install Supabase client library
- [x] Configure Supabase connection
- [x] Set up routing
- [x] Implement authentication with multiple providers

### 2.2 Multi-Platform Source Management
- [ ] Create UI to add/remove sources across platforms
- [ ] Add **platform selector dropdown** in add source form
- [ ] Add form for configuring filters:
  - Platform selection
  - Source identifier (dynamic label based on platform)
  - Minimum engagement score (dynamic label based on platform)
  - Minimum comments
  - Keywords
  - Platform-specific configuration (collapsible advanced options)
- [ ] Display list of monitored sources with platform badges/icons
- [ ] Enable/disable individual sources
- [ ] Group sources by platform (optional view toggle)
- [ ] Add platform filter to source list

### 2.3 Content Queue & Analysis Dashboard
- [ ] Display pending content awaiting analysis (all platforms)
- [ ] Show AI analysis results with:
  - **Platform badge** (icon + color)
  - Content type indicator (post, question, issue, etc.)
  - Confidence scoring
  - Engagement strategy preview
  - Brand opportunity highlights
- [ ] Add "Copy Strategy" button for quick access
- [ ] Implement manual reprocess functionality
- [ ] Add content filtering:
  - By platform
  - By content type
  - By confidence score
  - By engagement metrics
- [ ] Add search across all platforms

### 2.4 Realtime Features
- [ ] Subscribe to Supabase Realtime on `ai_analysis` table
- [ ] Implement live notifications feed
- [ ] Add real-time UI updates for new analyses
- [ ] Show connection status indicator

### 2.5 Analytics Dashboard
- [ ] Track engagement success rate (overall and per-platform)
- [ ] Monitor brand mention growth
- [ ] Display source activity metrics with **platform breakdown**:
  - Content discovered per platform
  - Average engagement score per platform
  - Opportunities generated per platform
- [ ] Show AI confidence score trends
- [ ] Add date range filtering
- [ ] **Platform comparison charts** (bar chart, pie chart)
- [ ] Performance leaderboard by platform

---

## Phase 3: Testing & Optimization (2-3 days)

### 3.1 Testing
- [ ] Test database operations and queries
- [ ] Verify RLS policies
- [ ] Test Realtime updates in frontend
- [ ] Validate form submissions and data integrity
- [ ] Test error handling scenarios
- [ ] Cross-browser testing

### 3.2 Performance Optimization
- [ ] Optimize database queries
- [ ] Implement proper indexing
- [ ] Add caching strategies
- [ ] Optimize frontend bundle size
- [ ] Improve page load times

### 3.3 Security & Compliance
- [ ] Review and strengthen RLS policies
- [ ] Audit secrets management
- [ ] Implement proper error logging (without exposing secrets)
- [ ] Add input validation
- [ ] Review data privacy considerations

---

## Phase 4: Polish & Documentation (1-2 days)

### 4.1 Documentation
- [ ] Write setup instructions
- [ ] Document environment variables
- [ ] Document database schema
- [ ] Add code comments
- [ ] Write troubleshooting guide

### 4.2 UI/UX Improvements
- [ ] Improve responsive design
- [ ] Add loading states
- [ ] Implement error messages
- [ ] Add success confirmations
- [ ] Polish overall design

### 4.3 Monitoring & Logging
- [ ] Set up error tracking
- [ ] Add performance monitoring
- [ ] Implement usage analytics
- [ ] Create admin dashboard for system health

---

## Phase 5: Backend Workers - Multi-Platform (Deferred - 4-6 days)

### 5.1 Cloudflare Worker Setup
- [ ] Create base worker architecture with adapter pattern
- [ ] Create Worker: Platform Monitor Orchestrator (cron-triggered)
- [ ] Create Worker: AI Processor (event-triggered, platform-agnostic)
- [ ] Configure `wrangler.toml` with cron schedules per platform
- [ ] Add environment secrets:
  - `SUPABASE_URL`
  - `SUPABASE_KEY`
  - `OPENROUTER_API_KEY`
  - `TELEGRAM_BOT_TOKEN`
  - Platform-specific API keys (Reddit, HN, PH, GitHub, etc.)

### 5.2 Base Monitor Abstract Class
- [ ] Create `BaseMonitor` abstract class with common interface
- [ ] Implement shared deduplication logic
- [ ] Implement shared filtering logic (keywords, engagement)
- [ ] Implement shared database insertion logic
- [ ] Add rate limiting framework (configurable per platform)
- [ ] Add error handling and retry logic
- [ ] Create monitoring and logging utilities

### 5.3 Reddit Monitor Worker (Refactor Existing)
- [ ] Refactor to extend `BaseMonitor` class
- [ ] Implement Reddit API fetching from JSON endpoint
- [ ] Transform Reddit data to generic `Content` format
- [ ] Add User-Agent headers for API compliance
- [ ] Map Reddit-specific fields to `platform_specific_data`
- [ ] Implement rate limiting (respect 60 req/min)
- [ ] Set up cron trigger (every 5-10 minutes)

### 5.4 Hacker News Monitor Worker
- [ ] Implement `HackerNewsMonitor` extending `BaseMonitor`
- [ ] Integrate with HN Firebase API
- [ ] Fetch stories from /newstories, /beststories, /askstories
- [ ] Transform HN data to generic `Content` format
- [ ] Map HN-specific fields (descendants, type, by) to JSONB
- [ ] Implement rate limiting
- [ ] Set up cron trigger

### 5.5 Product Hunt Monitor Worker
- [ ] Implement `ProductHuntMonitor` extending `BaseMonitor`
- [ ] Integrate with Product Hunt GraphQL API
- [ ] Fetch posts by category/tag
- [ ] Transform PH data to generic `Content` format
- [ ] Map PH-specific fields to JSONB
- [ ] Implement OAuth token refresh
- [ ] Handle API rate limits (500 req/hour)

### 5.6 Additional Platform Workers (Optional)
- [ ] **GitHub Monitor**: Issues, PRs, Discussions via GraphQL
- [ ] **Stack Overflow Monitor**: Questions by tag via REST API
- [ ] **Twitter Monitor**: Tweets/mentions via Twitter API v2
- [ ] **Discord Monitor**: Messages via Discord Gateway/Webhooks

### 5.7 OpenRouter Integration (Platform-Agnostic AI Processor)
- [ ] Implement OpenRouter API client
- [ ] Design platform-agnostic AI analysis prompt
- [ ] Include platform context in prompts (e.g., "This is a Hacker News story...")
- [ ] Process content from ANY platform through OpenRouter
- [ ] Parse AI responses for:
  - Engagement strategy
  - Brand opportunity
  - Recommended action
  - Confidence score
- [ ] Store analysis results in `ai_analysis` table
- [ ] Implement cost control measures (confidence thresholds)
- [ ] Add error handling for API failures
- [ ] Support streaming for real-time analysis updates

### 5.4 Telegram Bot Setup
- [ ] Create bot via @BotFather
- [ ] Store bot token as Cloudflare secret
- [ ] Deploy webhook worker
- [ ] Configure webhook URL
- [ ] Test basic message sending

### 5.8 Telegram Notification Worker (Platform-Agnostic)
- [ ] Set up trigger on new `ai_analysis` rows
- [ ] Format notification messages with content details:
  - **Include platform badge/icon in message**
  - Content title and preview
  - Engagement metrics (platform-appropriate labels)
  - AI analysis summary
- [ ] Add inline keyboard buttons:
  - "View Content" (link to platform URL)
  - "Mark as Engaged" (callback)
- [ ] Implement callback query handlers
- [ ] Add notification batching for rate limit compliance
- [ ] Update `notifications` table on successful send
- [ ] Support rich media (images, embeds) when available

### 5.9 Multi-Platform Worker Testing & Optimization
- [ ] Test with multiple platforms simultaneously:
  - 2-3 Reddit subreddits
  - 1-2 Hacker News sections
  - 1 Product Hunt category
- [ ] Verify deduplication logic across platforms
- [ ] Test rate limiting behavior per platform
- [ ] Validate Telegram notifications from all platforms
- [ ] Test AI analysis quality across different content types
- [ ] Add caching strategies per platform
- [ ] Add backoff logic for API failures
- [ ] Optimize Worker cold starts
- [ ] Monitor and log platform-specific errors

---

## Phase 6: Final Integration & Testing (1-2 days)

### 6.1 End-to-End Testing
- [ ] Test complete flow: Reddit → Database → AI → Telegram → Frontend
- [ ] Verify all integrations work together
- [ ] Test with multiple subreddits simultaneously
- [ ] Validate data consistency across all components
- [ ] Test error recovery scenarios

### 6.2 AI Prompt Optimization
- [ ] Review AI analysis outputs
- [ ] Tune prompts for better quality
- [ ] Implement human feedback loop
- [ ] Adjust confidence scoring thresholds
- [ ] Reduce false positives

### 6.3 Final Polish
- [ ] Review Reddit API terms of service compliance
- [ ] Final security audit
- [ ] Performance testing under load
- [ ] Documentation review and updates
- [ ] Prepare for production deployment

---

## Future Enhancements (Post-MVP)

### Advanced Features
- [ ] Multi-user support with authentication
- [ ] Custom AI model selection
- [ ] Support for multiple notification channels (Discord, Slack, Email)
- [ ] Advanced filtering with regex support
- [ ] Sentiment analysis
- [ ] Competitor mention tracking
- [ ] Automated engagement posting (with approval workflow)

### Integrations
- [ ] Integration with more AI providers
- [ ] Reddit OAuth for posting replies
- [ ] Analytics export (CSV, PDF)
- [ ] Webhook support for custom integrations

### Scalability
- [ ] Implement queue system for high-volume processing
- [ ] Add caching layer (Redis/KV)
- [ ] Optimize for monitoring 50+ subreddits
- [ ] Implement priority queuing for high-value posts

---

## Success Metrics

### Technical Metrics
- Reddit API response time < 2s
- AI analysis processing time < 5s
- Notification delivery time < 10s
- System uptime > 99.5%
- Zero duplicate post processing

### Business Metrics
- 90%+ relevant post detection rate
- <10% false positive rate
- Average AI confidence score > 0.7
- User engagement rate with notifications

---

## Resources & Dependencies

### External Services
- Cloudflare Workers (Free tier: 100k req/day)
- Supabase (Free tier)
- OpenRouter (Pay-per-use)
- Telegram Bot API (Free)
- Reddit JSON API (60 req/min limit)

### Development Tools
- Node.js & npm
- Wrangler CLI
- Git for version control
- IDE/Text editor

### Documentation References
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Supabase Docs](https://supabase.com/docs)
- [OpenRouter API Docs](https://openrouter.ai/docs)
- [Telegram Bot API Docs](https://core.telegram.org/bots/api)
- [Reddit API Docs](https://www.reddit.com/dev/api/)

---

## Timeline Overview

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Database Foundation | 1-2 days | Pending |
| Phase 2: Frontend Dashboard | 2-3 days | Pending |
| Phase 3: Testing & Optimization | 2-3 days | Pending |
| Phase 4: Polish & Documentation | 1-2 days | Pending |
| Phase 5: Backend Workers (Deferred) | 2-3 days | Deferred |
| Phase 6: Final Integration | 1-2 days | Deferred |
| **Total Estimated Time (MVP)** | **6-10 days** | - |
| **Total with Workers** | **9-15 days** | - |

---

## Notes

- This roadmap prioritizes database and frontend first, deferring backend workers for later
- MVP (Phases 1-4) delivers a functional database and UI for managing and viewing data
- Backend workers (Phase 5) can be added later for automated Reddit monitoring
- This approach allows for faster initial development and UI validation
- Each phase can be developed iteratively
- Testing should occur throughout all phases
- Consider setting up CI/CD early in the process
