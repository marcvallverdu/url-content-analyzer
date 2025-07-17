# URL Content Analyzer

A Next.js application that analyzes web content using Firecrawl and OpenAI APIs.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Add your Firecrawl API key (get from https://firecrawl.dev)
   - Add your OpenAI API key

3. Run the development server:
```bash
npm run dev
```

## Deployment to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard:
   - `FIRECRAWL_API_KEY`
   - `OPENAI_API_KEY`
4. Deploy!

## Features

- Upload URLs via text input or CSV file
- Crawl web content using Firecrawl API
- Analyze content with GPT-4 using custom prompts
- Display results in a sortable table with scores