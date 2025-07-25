// api/analyze.js
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const patterns = require('../lib/detectionPatterns');   // relative to /api

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'POST only' });
  }

  const { url } = req.body || {};
  if (!url) {
    return res.status(400).json({ success: false, error: 'Missing url' });
  }

  const browserless = `https://production-sfo.browserless.io/content?token=${process.env.BROWSERLESS_TOKEN}`;

  try {
    const htmlResp = await fetch(browserless, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (!htmlResp.ok) throw new Error(await htmlResp.text());

    const html = await htmlResp.text();
    const { document } = new JSDOM(html).window;

    // ---- scrape -----------------------------------------------------------
    const result = {
      url,
      timestamp: new Date().toISOString(),
      identitySolutions: {},
      prebid: { detected: false, evidence: [] },
      scripts: []
    };

    // scan every <script>
    document.querySelectorAll('script').forEach(script => {
      const src = script.src || 'inline';
      const code = script.innerHTML.slice(0, 600);   // enough for signatures

      const matches = [];
      // flatten patterns for easier scanning
      const all = [
        ...Object.values(patterns.identitySolutions).flatMap(s =>
          s.patterns.map(p => ({ pattern: p, solution: s.name }))
        ),
        ...patterns.prebid.patterns.map(p => ({ pattern: p, solution: 'Prebid' }))
      ];

      all.forEach(({ pattern, solution }) => {
        const hit =
          src.toLowerCase().includes(pattern.toLowerCase()) ||
          code.toLowerCase().includes(pattern.toLowerCase());

        if (hit) matches.push({ solution, pattern, src });
      });

      if (matches.length) result.scripts.push({ src, matches });
    });

    // build identitySolutions & prebid summaries
    Object.entries(patterns.identitySolutions).forEach(([key, val]) => {
      const evidence = result.scripts.flatMap(s =>
        s.matches.filter(m => m.solution === val.name)
      );
      result.identitySolutions[key] = {
        name: val.name,
        detected: evidence.length > 0,
        evidence
      };
    });

    const prebidEvidence = result.scripts.flatMap(s =>
      s.matches.filter(m => m.solution === 'Prebid')
    );
    if (prebidEvidence.length) {
      result.prebid.detected = true;
      result.prebid.evidence = prebidEvidence;
    }

    return res.json({ success: true, result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
