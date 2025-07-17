'use client';

import { useState } from 'react';
import Papa from 'papaparse';

interface AnalysisResult {
  url: string;
  analysis?: any;
  error?: string;
  structuredData?: {
    mainEvaluation: Array<{
      id: string;
      score: number;
      rationale: string;
    }>;
    muveraSignals: Array<{
      name: string;
      score: number;
      notes: string;
    }>;
    semanticQuality: Array<{
      type: string;
      observed: string;
      improvement: string;
    }>;
    improvements: Array<{
      priority: string;
      type: string;
      description: string;
    }>;
  };
}

const CONTENT_AUDIT_PROMPT = `<content_quality_audit>
  <configuration>
    <page_url>{{PAGE_URL}}</page_url>
    <evaluation_scope>
      <include>
        <module>expert_module</module>
        <module>editorial_guidance</module>
        <module>shopper_tips</module>
        <module>store_policy_overviews</module>
      </include>
      <exclude>
        <element>coupon_cards</element>
        <element>footer</element>
        <element>navigation</element>
        <element>advertisements</element>
      </exclude>
    </evaluation_scope>
<evaluator_requirements>
  <framework>Google Search Quality Evaluator Guidelines (SQEG)</framework>
  <framework>Helpful Content System (2023-2025)</framework>
  <framework>June 2025 Core Update</framework>
  <framework>E-E-A-T Framework</framework>
  <framework>Muvera Algorithm</framework>
</evaluator_requirements>
  </configuration>
<evaluation_criteria>
<criterion id="purpose_spam_signals">
<name>Purpose and Spam Signals</name>
<scoring_range>1-5</scoring_range>
<evaluation_points>
<point>User-aligned function vs SEO filler</point>
<point>Absence of low-value padding or doorway behavior</point>
<point>Alignment with coupon-seeking user intent</point>
<point>Natural language without over-optimization</point>
</evaluation_points>
</criterion>
<criterion id="main_content_quality">
  <name>Main Content Quality</name>
  <scoring_range>1-5</scoring_range>
  <evaluation_points>
    <point>Originality and specificity of information</point>
    <point>Semantic cohesion with brand context</point>
    <point>Absence of automation residue or templating</point>
    <point>Depth beyond surface-level descriptions</point>
  </evaluation_points>
</criterion>

<criterion id="experience">
  <name>Experience Signals</name>
  <scoring_range>1-5</scoring_range>
  <evaluation_points>
    <point>Presence of firsthand examples</point>
    <point>Tested scenarios or workflows</point>
    <point>Evidence of actual interaction with systems</point>
    <point>Practical insights from usage</point>
  </evaluation_points>
</criterion>

<criterion id="expertise">
  <name>Expertise (Author Component)</name>
  <scoring_range>1-5</scoring_range>
  <evaluation_points>
    <point>Domain-specific author credentials</point>
    <point>Contextual tie between author and content</point>
    <point>Relevant qualifications displayed</point>
    <point>Clear attribution and byline</point>
  </evaluation_points>
</criterion>

<criterion id="authoritativeness">
  <name>Authoritativeness</name>
  <scoring_range>1-5</scoring_range>
  <evaluation_points>
    <point>Presence of structured data/schema</point>
    <point>Citations and references</point>
    <point>Timestamps and update dates</point>
    <point>Domain authority reinforcement</point>
  </evaluation_points>
</criterion>

<criterion id="trustworthiness">
  <name>Trustworthiness</name>
  <scoring_range>1-5</scoring_range>
  <evaluation_points>
    <point>Claims backed by verifiable sources</point>
    <point>Links to official policies</point>
    <point>Absence of bias or manipulation</point>
    <point>Transparent disclosure of relationships</point>
  </evaluation_points>
</criterion>

<criterion id="helpful_content">
  <name>Helpful Content Alignment</name>
  <scoring_range>1-5</scoring_range>
  <evaluation_points>
    <point>Value retention without monetization elements</point>
    <point>Genuine editorial voice</point>
    <point>Applied knowledge demonstration</point>
    <point>Irreplaceable unique insights</point>
  </evaluation_points>
</criterion>
</evaluation_criteria>
<output_format>
<main_evaluation>
<category>
<id>{{CRITERION_ID}}</id>
<score>{{SCORE}}</score>
<rationale>{{BRIEF_RATIONALE}}</rationale>
</category>
</main_evaluation>
<muvera_signals>
  <signal>
    <name>topical_relevance</name>
    <score>{{SCORE}}</score>
    <notes>{{NOTES}}</notes>
  </signal>
  <signal>
    <name>semantic_depth</name>
    <score>{{SCORE}}</score>
    <notes>{{NOTES}}</notes>
  </signal>
  <signal>
    <name>user_intent_alignment</name>
    <score>{{SCORE}}</score>
    <notes>{{NOTES}}</notes>
  </signal>
  <signal>
    <name>crawlability_schema</name>
    <score>{{SCORE}}</score>
    <notes>{{NOTES}}</notes>
  </signal>
  <signal>
    <name>readability</name>
    <score>{{SCORE}}</score>
    <notes>{{NOTES}}</notes>
  </signal>
  <signal>
    <name>engagement_freshness</name>
    <score>{{SCORE}}</score>
    <notes>{{NOTES}}</notes>
  </signal>
</muvera_signals>

<semantic_quality>
  <element>
    <type>keyword_usage</type>
    <observed>{{OBSERVATION}}</observed>
    <improvement>{{RECOMMENDATION}}</improvement>
  </element>
  <element>
    <type>brand_specificity</type>
    <observed>{{OBSERVATION}}</observed>
    <improvement>{{RECOMMENDATION}}</improvement>
  </element>
  <element>
    <type>depth_of_guidance</type>
    <observed>{{OBSERVATION}}</observed>
    <improvement>{{RECOMMENDATION}}</improvement>
  </element>
  <element>
    <type>shopper_perspective</type>
    <observed>{{OBSERVATION}}</observed>
    <improvement>{{RECOMMENDATION}}</improvement>
  </element>
  <element>
    <type>editorial_originality</type>
    <observed>{{OBSERVATION}}</observed>
    <improvement>{{RECOMMENDATION}}</improvement>
  </element>
</semantic_quality>

<actionable_improvements>
  <action>
    <priority>high</priority>
    <type>content_rewrite</type>
    <description>{{SPECIFIC_ACTION}}</description>
  </action>
  <action>
    <priority>medium</priority>
    <type>link_addition</type>
    <description>{{SPECIFIC_ACTION}}</description>
  </action>
  <action>
    <priority>medium</priority>
    <type>author_enhancement</type>
    <description>{{SPECIFIC_ACTION}}</description>
  </action>
  <action>
    <priority>low</priority>
    <type>workflow_integration</type>
    <description>{{SPECIFIC_ACTION}}</description>
  </action>
</actionable_improvements>
</output_format>
  <instructions>
    <instruction>Return only structured XML data</instruction>
    <instruction>No introductory text or explanations</instruction>
    <instruction>All scores must be integers 1-5</instruction>
    <instruction>All text fields must be concise and actionable</instruction>
    <instruction>Replace placeholder values with actual analysis</instruction>
  </instructions>
</content_quality_audit>`;

export default function Home() {
  const [urls, setUrls] = useState<string>('');
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const urlList = results.data
          .flat()
          .filter((item): item is string => typeof item === 'string' && item.startsWith('http'))
          .join('\n');
        setUrls(urlList);
      },
      header: false,
    });
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const exportToCSV = () => {
    if (results.length === 0) return;

    const headers = [
      'URL',
      'Status',
      // E-E-A-T Scores with full names
      'Purpose and Spam Signals',
      'Main Content Quality',
      'Experience Signals',
      'Expertise (Author Component)',
      'Authoritativeness',
      'Trustworthiness',
      'Helpful Content Alignment',
      // Muvera Signals with full names
      'Topical Relevance',
      'Semantic Depth',
      'User Intent Alignment',
      'Crawlability Schema',
      'Readability',
      'Engagement Freshness',
      // Average Scores
      'E-E-A-T Average Score',
      'Muvera Average Score',
      'Overall Average Score',
      // Top Priority Improvements
      'High Priority Actions',
      'Medium Priority Actions'
    ];

    const rows = results.map(result => {
      if (result.error) {
        return [result.url, 'Error', ...Array(headers.length - 2).fill(result.error)];
      }

      if (!result.structuredData) {
        return [result.url, 'No Data', ...Array(headers.length - 2).fill('N/A')];
      }

      const data = result.structuredData;
      
      // Create score maps for easy access
      const eeatScores = new Map(data.mainEvaluation.map(e => [e.id, e.score]));
      const muveraScores = new Map(data.muveraSignals.map(s => [s.name, s.score]));
      
      // Calculate averages
      const eeatAvg = data.mainEvaluation.reduce((sum, e) => sum + e.score, 0) / data.mainEvaluation.length;
      const muveraAvg = data.muveraSignals.reduce((sum, s) => sum + s.score, 0) / data.muveraSignals.length;
      const overallAvg = (eeatAvg + muveraAvg) / 2;
      
      // Get priority improvements
      const highPriority = data.improvements
        .filter(i => i.priority === 'high')
        .map(i => i.description)
        .join(' | ');
      const mediumPriority = data.improvements
        .filter(i => i.priority === 'medium')
        .map(i => i.description)
        .join(' | ');

      return [
        result.url,
        'Success',
        // E-E-A-T Scores
        eeatScores.get('purpose_spam_signals') || 0,
        eeatScores.get('main_content_quality') || 0,
        eeatScores.get('experience') || 0,
        eeatScores.get('expertise') || 0,
        eeatScores.get('authoritativeness') || 0,
        eeatScores.get('trustworthiness') || 0,
        eeatScores.get('helpful_content') || 0,
        // Muvera Signals
        muveraScores.get('topical_relevance') || 0,
        muveraScores.get('semantic_depth') || 0,
        muveraScores.get('user_intent_alignment') || 0,
        muveraScores.get('crawlability_schema') || 0,
        muveraScores.get('readability') || 0,
        muveraScores.get('engagement_freshness') || 0,
        // Averages
        eeatAvg.toFixed(2),
        muveraAvg.toFixed(2),
        overallAvg.toFixed(2),
        // Improvements
        highPriority || 'None',
        mediumPriority || 'None'
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `content-audit-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseXMLResponse = (xmlString: string) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      // Parse main evaluation categories
      const mainEvaluation: any[] = [];
      const categories = xmlDoc.querySelectorAll('main_evaluation category');
      categories.forEach(cat => {
        mainEvaluation.push({
          id: cat.querySelector('id')?.textContent || '',
          score: parseInt(cat.querySelector('score')?.textContent || '0'),
          rationale: cat.querySelector('rationale')?.textContent || ''
        });
      });
      
      // Parse Muvera signals
      const muveraSignals: any[] = [];
      const signals = xmlDoc.querySelectorAll('muvera_signals signal');
      signals.forEach(signal => {
        muveraSignals.push({
          name: signal.querySelector('name')?.textContent || '',
          score: parseInt(signal.querySelector('score')?.textContent || '0'),
          notes: signal.querySelector('notes')?.textContent || ''
        });
      });
      
      // Parse semantic quality
      const semanticQuality: any[] = [];
      const elements = xmlDoc.querySelectorAll('semantic_quality element');
      elements.forEach(element => {
        semanticQuality.push({
          type: element.querySelector('type')?.textContent || '',
          observed: element.querySelector('observed')?.textContent || '',
          improvement: element.querySelector('improvement')?.textContent || ''
        });
      });
      
      // Parse improvements
      const improvements: any[] = [];
      const actions = xmlDoc.querySelectorAll('actionable_improvements action');
      actions.forEach(action => {
        improvements.push({
          priority: action.querySelector('priority')?.textContent || '',
          type: action.querySelector('type')?.textContent || '',
          description: action.querySelector('description')?.textContent || ''
        });
      });
      
      return {
        mainEvaluation,
        muveraSignals,
        semanticQuality,
        improvements
      };
    } catch (error) {
      console.error('Error parsing XML:', error);
      return null;
    }
  };

  const analyzeUrls = async () => {
    if (!urls.trim()) {
      alert('Please provide URLs');
      return;
    }

    setLoading(true);
    setResults([]);
    setLogs([]);

    const urlList = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.startsWith('http'));

    addLog(`Starting analysis of ${urlList.length} URLs`);

    // Process URLs in parallel with a concurrency limit
    const BATCH_SIZE = 3; // Process 3 URLs at a time
    const results: AnalysisResult[] = [];

    for (let i = 0; i < urlList.length; i += BATCH_SIZE) {
      const batch = urlList.slice(i, i + BATCH_SIZE);
      addLog(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(urlList.length / BATCH_SIZE)}`);
      
      const batchPromises = batch.map(async (url) => {
        try {
          addLog(`Crawling: ${url}`);
          const crawlResponse = await fetch('/api/crawl', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          });

          if (!crawlResponse.ok) {
            const errorData = await crawlResponse.text();
            throw new Error(`Failed to crawl URL: ${errorData}`);
          }

          const crawlData = await crawlResponse.json();
          const { content } = crawlData;
          
          if (!content) {
            throw new Error('No content received from crawl API');
          }
          
          addLog(`✓ Crawled ${url} - Content length: ${content.length} characters`);

          addLog(`Analyzing content from: ${url}`);
          const promptWithUrl = CONTENT_AUDIT_PROMPT.replace('{{PAGE_URL}}', url);
          
          const analyzeResponse = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, prompt: promptWithUrl }),
          });

          if (!analyzeResponse.ok) {
            const errorData = await analyzeResponse.text();
            throw new Error(`Failed to analyze content: ${errorData}`);
          }

          const analyzeData = await analyzeResponse.json();
          const { analysis } = analyzeData;
          
          // Parse XML response
          const structuredData = parseXMLResponse(analysis);
          
          addLog(`✓ Analysis complete for ${url}`);

          return { url, analysis, structuredData };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          addLog(`✗ Error processing ${url}: ${errorMsg}`);
          return { url, error: errorMsg };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      setResults([...results]);
    }

    addLog('All URLs processed');
    setLoading(false);
  };

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">URL Content Analyzer</h1>

      <div className="space-y-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Content Quality Audit Tool</h2>
          <p className="text-sm text-gray-700">
            This tool analyzes web pages against Google Search Quality Guidelines, E-E-A-T Framework, 
            and Muvera Algorithm signals to provide comprehensive content quality assessment.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            URLs (one per line)
          </label>
          <textarea
            className="w-full p-3 border rounded-lg h-32"
            placeholder="https://example.com&#10;https://another-site.com"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Or upload CSV file
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          onClick={analyzeUrls}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Analyzing...' : 'Analyze URLs'}
        </button>
      </div>

      {logs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Process Log</h2>
          <div className="bg-gray-100 p-4 rounded-lg h-40 overflow-y-auto font-mono text-sm">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Analysis Results</h2>
            <button
              onClick={exportToCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
            >
              Export to CSV
            </button>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                    URL
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={7}>
                    E-E-A-T Scores
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={6}>
                    Muvera Signals
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={3}>
                    Averages
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                    Status
                  </th>
                  {/* E-E-A-T Headers */}
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 cursor-help relative group" title="Purpose and Spam Signals">
                    PSS
                    <div className="absolute z-20 invisible group-hover:visible bg-gray-900 text-white text-xs rounded p-2 top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                      Purpose and Spam Signals
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                        <div className="border-4 border-transparent border-b-gray-900"></div>
                      </div>
                    </div>
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 cursor-help relative group" title="Main Content Quality">
                    MCQ
                    <div className="absolute z-20 invisible group-hover:visible bg-gray-900 text-white text-xs rounded p-2 top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                      Main Content Quality
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                        <div className="border-4 border-transparent border-b-gray-900"></div>
                      </div>
                    </div>
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 cursor-help relative group" title="Experience Signals">
                    EXP
                    <div className="absolute z-20 invisible group-hover:visible bg-gray-900 text-white text-xs rounded p-2 top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                      Experience Signals
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                        <div className="border-4 border-transparent border-b-gray-900"></div>
                      </div>
                    </div>
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 cursor-help relative group" title="Expertise (Author Component)">
                    EXR
                    <div className="absolute z-20 invisible group-hover:visible bg-gray-900 text-white text-xs rounded p-2 top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                      Expertise (Author Component)
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                        <div className="border-4 border-transparent border-b-gray-900"></div>
                      </div>
                    </div>
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 cursor-help relative group" title="Authoritativeness">
                    AUTH
                    <div className="absolute z-20 invisible group-hover:visible bg-gray-900 text-white text-xs rounded p-2 top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                      Authoritativeness
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                        <div className="border-4 border-transparent border-b-gray-900"></div>
                      </div>
                    </div>
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 cursor-help relative group" title="Trustworthiness">
                    TRU
                    <div className="absolute z-20 invisible group-hover:visible bg-gray-900 text-white text-xs rounded p-2 top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                      Trustworthiness
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                        <div className="border-4 border-transparent border-b-gray-900"></div>
                      </div>
                    </div>
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 cursor-help relative group" title="Helpful Content Alignment">
                    HC
                    <div className="absolute z-20 invisible group-hover:visible bg-gray-900 text-white text-xs rounded p-2 top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                      Helpful Content Alignment
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                        <div className="border-4 border-transparent border-b-gray-900"></div>
                      </div>
                    </div>
                  </th>
                  {/* Muvera Headers */}
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 cursor-help relative group" title="Topical Relevance">
                    TR
                    <div className="absolute z-20 invisible group-hover:visible bg-gray-900 text-white text-xs rounded p-2 top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                      Topical Relevance
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                        <div className="border-4 border-transparent border-b-gray-900"></div>
                      </div>
                    </div>
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 cursor-help relative group" title="Semantic Depth">
                    SD
                    <div className="absolute z-20 invisible group-hover:visible bg-gray-900 text-white text-xs rounded p-2 top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                      Semantic Depth
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                        <div className="border-4 border-transparent border-b-gray-900"></div>
                      </div>
                    </div>
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 cursor-help relative group" title="User Intent Alignment">
                    UIA
                    <div className="absolute z-20 invisible group-hover:visible bg-gray-900 text-white text-xs rounded p-2 top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                      User Intent Alignment
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                        <div className="border-4 border-transparent border-b-gray-900"></div>
                      </div>
                    </div>
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 cursor-help relative group" title="Crawlability Schema">
                    CS
                    <div className="absolute z-20 invisible group-hover:visible bg-gray-900 text-white text-xs rounded p-2 top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                      Crawlability Schema
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                        <div className="border-4 border-transparent border-b-gray-900"></div>
                      </div>
                    </div>
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 cursor-help relative group" title="Readability">
                    RD
                    <div className="absolute z-20 invisible group-hover:visible bg-gray-900 text-white text-xs rounded p-2 top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                      Readability
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                        <div className="border-4 border-transparent border-b-gray-900"></div>
                      </div>
                    </div>
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 cursor-help relative group" title="Engagement Freshness">
                    EF
                    <div className="absolute z-20 invisible group-hover:visible bg-gray-900 text-white text-xs rounded p-2 top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                      Engagement Freshness
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                        <div className="border-4 border-transparent border-b-gray-900"></div>
                      </div>
                    </div>
                  </th>
                  {/* Averages */}
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500" title="E-E-A-T Average Score">E-E-A-T</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500" title="Muvera Average Score">Muvera</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500" title="Overall Average Score">Total</th>
                  {/* Actions */}
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result, index) => {
                  const data = result.structuredData;
                  const eeatScores = data ? new Map(data.mainEvaluation.map(e => [e.id, e.score])) : new Map();
                  const muveraScores = data ? new Map(data.muveraSignals.map(s => [s.name, s.score])) : new Map();
                  
                  const eeatAvg = data ? data.mainEvaluation.reduce((sum, e) => sum + e.score, 0) / data.mainEvaluation.length : 0;
                  const muveraAvg = data ? data.muveraSignals.reduce((sum, s) => sum + s.score, 0) / data.muveraSignals.length : 0;
                  const overallAvg = data ? (eeatAvg + muveraAvg) / 2 : 0;

                  const ScoreCell = ({ score, title }: { score: number; title?: string }) => (
                    <td 
                      className={`px-2 py-3 text-center text-sm relative group cursor-help ${
                        score >= 4 ? 'bg-green-50 text-green-800 font-medium' :
                        score >= 3 ? 'bg-yellow-50 text-yellow-800' :
                        score > 0 ? 'bg-red-50 text-red-800' :
                        'text-gray-400'
                      }`}
                      title={title}
                    >
                      {score || '-'}
                      {title && (
                        <div className="absolute z-10 invisible group-hover:visible bg-gray-900 text-white text-xs rounded p-2 bottom-full left-1/2 transform -translate-x-1/2 mb-1 whitespace-nowrap">
                          {title}: {score || 0}/5
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      )}
                    </td>
                  );

                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-inherit z-10">
                        <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {result.url.replace(/^https?:\/\/(www\.)?/, '').substring(0, 30)}...
                        </a>
                        <div className="text-xs text-gray-500">
                          {result.error ? (
                            <span className="text-red-600">Error</span>
                          ) : (
                            <span className="text-green-600">Success</span>
                          )}
                        </div>
                      </td>
                      {/* E-E-A-T Scores */}
                      <ScoreCell score={eeatScores.get('purpose_spam_signals') || 0} title="Purpose and Spam Signals" />
                      <ScoreCell score={eeatScores.get('main_content_quality') || 0} title="Main Content Quality" />
                      <ScoreCell score={eeatScores.get('experience') || 0} title="Experience Signals" />
                      <ScoreCell score={eeatScores.get('expertise') || 0} title="Expertise (Author Component)" />
                      <ScoreCell score={eeatScores.get('authoritativeness') || 0} title="Authoritativeness" />
                      <ScoreCell score={eeatScores.get('trustworthiness') || 0} title="Trustworthiness" />
                      <ScoreCell score={eeatScores.get('helpful_content') || 0} title="Helpful Content Alignment" />
                      {/* Muvera Signals */}
                      <ScoreCell score={muveraScores.get('topical_relevance') || 0} title="Topical Relevance" />
                      <ScoreCell score={muveraScores.get('semantic_depth') || 0} title="Semantic Depth" />
                      <ScoreCell score={muveraScores.get('user_intent_alignment') || 0} title="User Intent Alignment" />
                      <ScoreCell score={muveraScores.get('crawlability_schema') || 0} title="Crawlability Schema" />
                      <ScoreCell score={muveraScores.get('readability') || 0} title="Readability" />
                      <ScoreCell score={muveraScores.get('engagement_freshness') || 0} title="Engagement Freshness" />
                      {/* Averages */}
                      <td className="px-2 py-3 text-center text-sm font-medium">{eeatAvg ? eeatAvg.toFixed(1) : '-'}</td>
                      <td className="px-2 py-3 text-center text-sm font-medium">{muveraAvg ? muveraAvg.toFixed(1) : '-'}</td>
                      <td className={`px-2 py-3 text-center text-sm font-bold ${
                        overallAvg >= 4 ? 'text-green-700' :
                        overallAvg >= 3 ? 'text-yellow-700' :
                        overallAvg > 0 ? 'text-red-700' :
                        'text-gray-400'
                      }`}>
                        {overallAvg ? overallAvg.toFixed(1) : '-'}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        {data && (
                          <details className="cursor-pointer">
                            <summary className="text-xs text-blue-600 hover:underline">View</summary>
                            <div className="absolute z-20 mt-2 w-96 p-4 bg-white border rounded-lg shadow-lg text-left">
                              <h4 className="font-semibold mb-2">Top Improvements</h4>
                              {data.improvements
                                .filter(i => i.priority !== 'low')
                                .slice(0, 3)
                                .map((action, i) => (
                                  <div key={i} className="mb-2 text-xs">
                                    <span className={`inline-block px-2 py-1 rounded mr-2 ${
                                      action.priority === 'high' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {action.priority}
                                    </span>
                                    <span>{action.description}</span>
                                  </div>
                                ))}
                            </div>
                          </details>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>E-E-A-T Legend:</strong> PSS=Purpose & Spam Signals, MCQ=Main Content Quality, EXP=Experience, EXR=Expertise, AUTH=Authoritativeness, TRU=Trustworthiness, HC=Helpful Content</p>
            <p><strong>Muvera Legend:</strong> TR=Topical Relevance, SD=Semantic Depth, UIA=User Intent Alignment, CS=Crawlability Schema, RD=Readability, EF=Engagement Freshness</p>
          </div>
        </div>
      )}
    </main>
  );
}