import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Placeholder endpoints (will implement in later tasks)
app.get('/api/trends', (req, res) => {
  res.json({ trends: [], message: 'Trends endpoint not yet implemented' });
});

app.get('/api/deals', (req, res) => {
  res.json({ deals: [], message: 'Deals endpoint not yet implemented' });
});

app.get('/api/founders', (req, res) => {
  res.json({ founders: [], message: 'Founders endpoint not yet implemented' });
});

app.get('/api/api-status', (req, res) => {
  res.json({ apis: {}, message: 'API status endpoint not yet implemented' });
});

app.listen(PORT, () => {
  console.log(`VC Intelligence Hub backend running on http://localhost:${PORT}`);
});
