const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'NFT Marketplace Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Contract configuration endpoint
app.get('/api/config', (req, res) => {
  res.json({
    network: 'sepolia',
    contracts: {
      marketplace: '0x96D052e194287Ef980D45B43234762C8ADD9c89E',
      erc721: '0xB22679365f71552Fc6448f99891e2e63b04f020E',
      erc1155: '0x36478ed8b1CacC31ca1709b1013688fdB9c7Be7b'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NFT Marketplace Backend Server running on port ${PORT}`);
  console.log(`📡 API available at: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`⚙️  Config endpoint: http://localhost:${PORT}/api/config`);
});

module.exports = app;
