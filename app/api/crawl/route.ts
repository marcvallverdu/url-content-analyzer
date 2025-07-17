import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const maxDuration = 60; // Increase timeout to 60 seconds

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    console.log(`[Crawl API] Received request to crawl: ${url}`);

    if (!url) {
      console.error('[Crawl API] No URL provided');
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    
    if (!firecrawlApiKey) {
      console.error('[Crawl API] Firecrawl API key not configured');
      return NextResponse.json(
        { error: 'Firecrawl API key not configured' },
        { status: 500 }
      );
    }

    console.log(`[Crawl API] Making request to Firecrawl for: ${url}`);
    const startTime = Date.now();
    
    let response;
    let apiVersion = 'v1';
    
    try {
      // Try v1 API first
      response = await axios.post(
        'https://api.firecrawl.dev/v1/scrape',
        {
          url
        },
        {
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (v1Error) {
      if (axios.isAxiosError(v1Error) && v1Error.response?.status === 402) {
        console.log('[Crawl API] v1 API requires payment, trying v0 API...');
        apiVersion = 'v0';
        
        // Try v0 API as fallback
        response = await axios.post(
          'https://api.firecrawl.dev/v0/scrape',
          {
            url,
            pageOptions: {
              onlyMainContent: true
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${firecrawlApiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        throw v1Error;
      }
    }

    const endTime = Date.now();
    
    // Log the full response structure
    console.log(`[Crawl API] Using API version: ${apiVersion}`);
    console.log('[Crawl API] Firecrawl response status:', response.status);
    console.log('[Crawl API] Response data:', JSON.stringify(response.data).substring(0, 1000));
    
    // Check if the response indicates success (v0 API doesn't have success field)
    if (apiVersion === 'v1' && response.data.success === false) {
      console.error('[Crawl API] Firecrawl API error:', response.data.error || 'Unknown error');
      throw new Error(response.data.error || 'Firecrawl API returned an error');
    }
    
    // Try different paths to get content based on API version
    let content = '';
    
    if (apiVersion === 'v1') {
      content = response.data.data?.markdown || 
                response.data.data?.html || 
                response.data.markdown || 
                '';
    } else {
      // v0 API structure
      content = response.data.data?.content || 
                response.data.data?.markdown || 
                response.data.content || 
                response.data.markdown ||
                '';
    }
    
    console.log(`[Crawl API] Successfully crawled ${url} in ${endTime - startTime}ms - Content length: ${content.length} characters`);
    
    if (!content) {
      console.error('[Crawl API] No content found in response. Full response:', JSON.stringify(response.data));
      throw new Error('No content extracted from page');
    }

    const responseData = { 
      content,
      contentLength: content.length,
      contentPreview: content.substring(0, 200)
    };
    
    console.log('[Crawl API] Sending response:', {
      contentLength: responseData.contentLength,
      hasContent: !!responseData.content
    });
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[Crawl API] Crawl error:', error);
    if (axios.isAxiosError(error)) {
      console.error('[Crawl API] Response status:', error.response?.status);
      console.error('[Crawl API] Response data:', error.response?.data);
    }
    return NextResponse.json(
      { error: 'Failed to crawl URL' },
      { status: 500 }
    );
  }
}