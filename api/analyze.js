const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const patterns = require('../lib/detectionPatterns');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'POST only' });
  }
  const { url } = req.body || {};
  if (!url) {
    return res.status(400).json({ success: false, error: 'Missing url' });
  }

  try {
    /* ---------- Fetch rendered HTML via ScrapingBee ---------- */
    const API = 'https://app.scrapingbee.com/api/v1/';
    const KEY = process.env.SCRAPINGBEE_KEY;

    const beeResp = await fetch(
      `${API}?api_key=${KEY}&url=${encodeURIComponent(url)}&render_js=true`,
      { headers: { 'Cache-Control': 'no-cache' } }
    );

    if (!beeResp.ok) throw new Error(`ScrapingBee ${beeResp.status}: ${await beeResp.text()}`);
    const html = await beeResp.text();

    /* ---------- Analyse ---------- */
    const { document } = new JSDOM(html).window;

    const result = {
      url,
      timestamp: new
