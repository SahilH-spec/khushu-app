require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const path    = require('path');

const apiRoutes = require('./routes/api');

const app  = express();
const PORT = process.env.PORT || 3000;

// Behind Railway's proxy: needed for correct client IPs (rate limiting)
app.set('trust proxy', 1);
app.disable('x-powered-by');

// The UI is served from this same server, so no cross-origin access is allowed by default.
// Set CORS_ORIGIN to a single origin if you host the UI elsewhere.
if (process.env.CORS_ORIGIN) {
  const cors = require('cors');
  app.use(cors({ origin: process.env.CORS_ORIGIN }));
}

app.use('/api', rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));
app.use(express.json({ limit: '50kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🕌  Khushu running → http://localhost:${PORT}\n`);
});
