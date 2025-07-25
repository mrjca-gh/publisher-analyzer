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
      timestamp: new Date().toISOString(),
      identitySolutions: {},
      prebid: { detected: false, evidence: [] },
      scripts: []
    };

    document.querySelectorAll('script').forEach(script => {
      const src = script.src || 'inline';
      const code = script.innerHTML.slice(0, 600);

      const hits = [];
      const all = [
        ...Object.values(patterns.identitySolutions).flatMap(s =>
          s.patterns.map(p => ({ pattern: p, solution: s.name }))
        ),
        ...patterns.prebid.patterns.map(p => ({ pattern: p, solution: 'Prebid' }))
      ];

      all.forEach(({ pattern, solution }) => {
        if (src.toLowerCase().includes(pattern.toLowerCase()) ||
            code.toLowerCase().includes(pattern.toLowerCase())) {
          hits.push({ solution, pattern, src });
        }
      });

      if (hits.length) result.scripts.push({ src, hits });
    });

    // summarise
    Object.entries(patterns.identitySolutions).forEach(([key, val]) => {
      const ev = result.scripts.flatMap(s => s.hits.filter(h => h.solution === val.name));
      result.identitySolutions[key] = { name: val.name, detected: ev.length > 0, evidence: ev };
    });
    const prebidEv = result.scripts.flatMap(s => s.hits.filter(h => h.solution === 'Prebid'));
    if (prebidEv.length) result.prebid = { detected: true, evidence: prebidEv };

    return res.json({ success: true, result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
