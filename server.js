const express = require('express');
const cors = require('cors');
const PublisherAnalyzer = require('./lib/analyzer');  // Updated path

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/api/analyze', async (req, res) => {
  const analyzer = new PublisherAnalyzer();
  
  try {
    await analyzer.initialize();
    const { url, urls } = req.body;
    
    if (urls) {
      const results = [];
      for (const u of urls) {
        const result = await analyzer.analyze(u);
        results.push(result);
      }
      res.json({ success: true, results, timestamp: new Date().toISOString() });
    } else {
      const result = await analyzer.analyze(url);
      res.json({ success: true, result, timestamp: new Date().toISOString() });
    }
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await analyzer.close();
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
