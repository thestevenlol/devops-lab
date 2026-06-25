const express = require('express');

const app = express();
app.use(express.json());

// log requests — handy in container logs
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// root — preserves your original greeting
app.get('/', (req, res) => {
  res.type('text/plain').send('Hello from Docker\n');
});

// health check — the CI smoke test hits this, and prod will too
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// greet with validation — real logic worth unit-testing
app.get('/api/greet/:name', (req, res) => {
  const name = req.params.name.trim();
  if (name.length === 0 || name.length > 50) {
    return res.status(400).json({ error: 'name must be 1-50 characters' });
  }
  res.json({ greeting: `Hello, ${name}!` });
});

// sum numbers from a JSON body — body parsing + validation + error paths
app.post('/api/sum', (req, res) => {
  const { numbers } = req.body ?? {};
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return res.status(400).json({ error: 'numbers must be a non-empty array' });
  }
  if (!numbers.every((n) => typeof n === 'number' && Number.isFinite(n))) {
    return res.status(400).json({ error: 'all items must be finite numbers' });
  }
  res.json({ total: numbers.reduce((a, b) => a + b, 0) });
});

// 404 — after all routes (Express 5: app.use, not app.get('*'))
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// error handler — 4 args so Express recognises it as one
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;

// dummy