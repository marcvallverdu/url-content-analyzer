import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const maxDuration = 60; // Increase timeout to 60 seconds

export async function POST(request: NextRequest) {
  try {
    const { content, prompt } = await request.json();
    console.log(`[Analyze API] Received request - Content length: ${content?.length || 0} characters`);

    if (!content || !prompt) {
      console.error('[Analyze API] Missing content or prompt');
      return NextResponse.json(
        { error: 'Content and prompt are required' },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.error('[Analyze API] OpenAI API key not configured');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    // GPT-4 can handle much more content - let's increase to 50k characters
    const maxContentLength = 50000;
    const truncatedContent = content.substring(0, maxContentLength);
    
    console.log(`[Analyze API] Original content: ${content.length} characters`);
    console.log(`[Analyze API] Truncated to: ${truncatedContent.length} characters`);
    console.log(`[Analyze API] Content was truncated: ${content.length > maxContentLength}`);
    console.log(`[Analyze API] Sending to OpenAI with prompt: "${prompt.substring(0, 100)}..."`);
    
    const startTime = Date.now();

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a web content quality evaluator. Return ONLY valid XML as specified in the prompt. No explanatory text before or after the XML."
        },
        {
          role: "user",
          content: `${prompt}\n\nContent to analyze:\n${truncatedContent}`
        }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });

    const endTime = Date.now();
    const response = completion.choices[0].message.content || '';
    
    console.log(`[Analyze API] OpenAI response received in ${endTime - startTime}ms - Response length: ${response.length} characters`);
    
    // Clean the response to ensure it's valid XML
    let cleanedResponse = response.trim();
    
    // Remove any text before the first < and after the last >
    const xmlStart = cleanedResponse.indexOf('<');
    const xmlEnd = cleanedResponse.lastIndexOf('>');
    
    if (xmlStart !== -1 && xmlEnd !== -1) {
      cleanedResponse = cleanedResponse.substring(xmlStart, xmlEnd + 1);
    }
    
    console.log(`[Analyze API] Cleaned XML response length: ${cleanedResponse.length} characters`);

    return NextResponse.json({ 
      analysis: cleanedResponse
    });
  } catch (error) {
    console.error('[Analyze API] Analysis error:', error);
    if (error instanceof Error) {
      console.error('[Analyze API] Error message:', error.message);
    }
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    );
  }
}