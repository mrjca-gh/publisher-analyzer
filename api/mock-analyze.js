module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, urls } = req.body;

  // Return mock data that matches your expected format
  const mockResult = {
    url: url || urls[0],
    timestamp: new Date().toISOString(),
    identitySolutions: {
      id5: { name: 'ID5', detected: false, evidence: [] },
      liveRamp: { name: 'LiveRamp', detected: false, evidence: [] },
      lotame: { name: 'Lotame', detected: false, evidence: [] },
      uid2: { name: 'UID2', detected: false, evidence: [] }
    },
    prebid: { 
      detected: url && url.includes('usatoday') ? true : false, 
      evidence: url && url.includes('usatoday') ? [{ solution: 'Prebid', pattern: 'pbjs' }] : [] 
    }
  };

  if (urls) {
    res.status(200).json({
      success: true,
      results: urls.map(u => ({ ...mockResult, url: u })),
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(200).json({
      success: true,
      result: mockResult,
      timestamp: new Date().toISOString()
    });
  }
};
