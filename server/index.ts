import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleGenerate } from './generate.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Routes
app.post('/api/generate', handleGenerate);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5),
  });
});

// Serve static frontend assets from dist folder if built
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Root fallback handler
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  // Try sending dist/index.html if built, otherwise friendly redirect notice
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Flam AI Study Assistant - Proxy Server</title>
            <style>
              body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { background: #1e293b; padding: 2rem; border-radius: 1rem; text-align: center; max-width: 480px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
              a { color: #818cf8; font-weight: bold; text-decoration: none; display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: #4f46e5; color: white; border-radius: 0.5rem; }
              a:hover { background: #6366f1; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>⚡ Flam AI Backend Proxy Running</h2>
              <p>Port 3001 is the backend API proxy holding your LLM key.</p>
              <p>To view the <strong>React Interactive UI</strong>, click below:</p>
              <a href="http://localhost:5174">Open Interactive UI (http://localhost:5174)</a>
            </div>
          </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, () => {
  console.log(`⚡ Flam Backend Proxy Server running at http://localhost:${PORT}`);
  console.log(`🔑 GEMINI_API_KEY status: ${process.env.GEMINI_API_KEY ? 'Present' : 'Not Set (Using Offline Mock Mode)'}`);
});

