# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview
This is a Next.js 14 application that analyzes web content quality using E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) Framework and Muvera Algorithm signals. It integrates with Firecrawl API for web scraping and OpenAI GPT-4 for content analysis.

## Development Commands
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production (TypeScript compilation + Next.js build)
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Architecture Overview

### API Integration Flow
1. **Frontend (app/page.tsx)** - Client component that handles:
   - URL input (manual or CSV upload via PapaParse)
   - Batch processing (3 URLs concurrently)
   - Real-time progress logging
   - Results display with interactive table

2. **Crawl API (app/api/crawl/route.ts)**
   - Integrates with Firecrawl API (v1 with v0 fallback)
   - Extracts web page content (up to 50k chars sent to GPT-4)
   - 60-second timeout for long pages

3. **Analyze API (app/api/analyze/route.ts)**
   - Sends crawled content + hardcoded XML prompt to GPT-4-turbo-preview
   - Parses structured XML response
   - Returns evaluation scores and recommendations

### Key Implementation Details

**Content Analysis Prompt**: The system uses a hardcoded XML-structured prompt (CONTENT_AUDIT_PROMPT in app/page.tsx) that evaluates:
- 7 E-E-A-T criteria (Purpose & Spam Signals, Main Content Quality, Experience, Expertise, Authoritativeness, Trustworthiness, Helpful Content)
- 6 Muvera signals (Topical Relevance, Semantic Depth, User Intent Alignment, Crawlability Schema, Readability, Engagement Freshness)

**API Response Handling**:
- Firecrawl responses vary between v0/v1 - check for `data.data.markdown`, `data.data.content`, or `data.markdown`
- OpenAI responses are cleaned to extract valid XML (removes any text before/after XML tags)

**Performance Considerations**:
- Content truncated to 50,000 characters for GPT-4
- Batch processing with Promise.all() for concurrent URL analysis
- Results update in real-time as each batch completes

## Environment Variables
Required in `.env.local`:
```
FIRECRAWL_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

## Common Issues & Solutions

**Firecrawl 402 Error**: The v1 API requires a paid plan. The app automatically falls back to v0 API when this occurs.

**Build Errors**: Ensure `structuredData` is `undefined` (not `null`) when XML parsing fails to match TypeScript interface.

**Rate Limits**: Implement retry logic if needed for production use. Current implementation processes in batches of 3 to avoid overwhelming APIs.

## Deployment
Ready for Vercel deployment. Add environment variables in Vercel dashboard before deploying.