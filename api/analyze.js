let chromium = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
 chromium = require('chrome-aws-lambda');
 puppeteer = require('puppeteer-core');
} else {
 puppeteer = require('puppeteer');
}

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

 let browser;
 
 try {
   browser = await puppeteer.launch({
     args: chromium.args || [
       '--no-sandbox',
       '--disable-setuid-sandbox',
       '--disable-dev-shm-usage',
       '--disable-gpu',
       '--no-first-run',
       '--no-zygote',
       '--single-process',
       '--disable-extensions'
     ],
     defaultViewport: chromium.defaultViewport || { width: 1920, height: 1080 },
     executablePath: await chromium.executablePath || puppeteer.executablePath(),
     headless: chromium.headless !== undefined ? chromium.headless : true,
     ignoreHTTPSErrors: true
   });

   const analyzer = new PublisherAnalyzer(browser);
   const results = [];
   
   const urlList = urls || [url];
   
   for (const targetUrl of urlList) {
     try {
       const result = await analyzer.analyze(targetUrl);
       results.push(result);
       
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

   if (urls) {
     res.status(200).json({
       success: true,
       results: results,
       timestamp: new Date().toISOString()
     });
   } else {
     res.status(200).json({
       success: true,
       result: results[0],
       timestamp: new Date().toISOString()
     });
   }

 } catch (error) {
   console.error('Browser launch error:', error);
   res.status(500).json({
     success: false,
     error: error.message,
     timestamp: new Date().toISOString()
   });
 } finally {
   if (browser) {
     try {
       await browser.close();
     } catch (closeError) {
       console.error('Error closing browser:', closeError);
     }
   }
 }
};
