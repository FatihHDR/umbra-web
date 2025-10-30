// Dev proxy to forward browser requests to Deepseek (keeps API key off the client)
// Usage: set DEEPSEEK_API_KEY and DEEPSEEK_TARGET_URL in .env and run: npm run start-proxy

require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.DEV_PROXY_PORT ? Number(process.env.DEV_PROXY_PORT) : 5000;
const TARGET = process.env.DEEPSEEK_TARGET_URL; // e.g. https://api.deepseek.ai/v1/query
const API_KEY = process.env.DEEPSEEK_API_KEY;

if (!TARGET || !API_KEY) {
  console.error('Missing DEEPSEEK_TARGET_URL or DEEPSEEK_API_KEY in environment.');
  console.error('Set these in your .env before running the proxy.');
  process.exit(1);
}

// Allow requests from the local frontend dev server
app.use(cors({ origin: ['http://localhost:5500', 'http://127.0.0.1:5500'] }));
app.use(express.json());

// Simple health
app.get('/', (req, res) => res.send('Umbra dev proxy running'));

// Proxy endpoint matching frontend path
app.post('/api/v1/deepseek/query', async (req, res) => {
  try {
    const upstreamUrl = 'https://api.deepseek.com/v1/chat/completions';
    // Ensure stream:true is set
    const upstreamBody = { ...req.body, stream: true };
    const upstreamResp = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(upstreamBody),
    });

    res.status(upstreamResp.status);
    // Forward headers for streaming
    res.setHeader('Content-Type', upstreamResp.headers.get('content-type') || 'text/event-stream');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (!upstreamResp.body) {
      res.end();
      return;
    }

    upstreamResp.body.on('data', (chunk) => {
      res.write(chunk);
    });
    upstreamResp.body.on('end', () => {
      res.end();
    });
    upstreamResp.body.on('error', (err) => {
      res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    });
  } catch (err) {
    console.error('Proxy error', err);
    return res.status(502).json({ error: 'Proxy failed to reach upstream', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Dev proxy listening on http://localhost:${PORT} -> ${TARGET}`);
});
