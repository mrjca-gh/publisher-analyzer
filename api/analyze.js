const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const PublisherAnalyzer = require('../lib/analyzer');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { url, urls } = req.body;

  if (!url && !urls) {
    return res.status(400).json({ error: 'URL or URLs array required' });
  }

  try {
    // Launch browser with Vercel-compatible settings
    const browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-extensions'
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: 'new',
      ignoreHTTPSErrors: true
    });

    const analyzer = new PublisherAnalyzer(browser);
    const results = [];
    
    // Handle single URL or multiple URLs
    const urlList = urls || [url];
    
    for (const targetUrl of urlList) {
      try {
        const result = await analyzer.analyze(targetUrl);
        results.push(result);
        // Add small delay between analyses
        if (urlList.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error analyzing ${targetUrl}:`, error);
        results.push({
          url: targetUrl,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    await browser.close();

    // Return results based on request type
    if (urls) {
      // Multiple URLs - return array
      res.status(200).json({
        success: true,
        results: results,
        timestamp: new Date().toISOString()
      });
    } else {
      // Single URL - return single result
      res.status(200).json({
        success: true,
        result: results[0],
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
