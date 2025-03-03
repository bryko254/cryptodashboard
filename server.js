const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Enable CORS for all routes
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// In-memory cache for crypto data
let cryptoData = null;
let chartData = {};

// Function to fetch cryptocurrency data from CoinGecko
async function fetchCryptoData() {
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,dogecoin,ripple,litecoin,usd-coin");
    const data = await response.json();
    cryptoData = data;
    console.log('Crypto data updated:', new Date().toISOString());
    
    // Emit the updated data to all connected clients
    io.emit('cryptoDataUpdate', cryptoData);
    
    return data;
  } catch (error) {
    console.error("Error fetching cryptocurrency data:", error);
    return null;
  }
}

// Function to fetch chart data for a specific crypto
async function fetchChartData(cryptoId) {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=usd&days=7`);
    const data = await response.json();
    chartData[cryptoId] = data;
    console.log(`Chart data updated for ${cryptoId}:`, new Date().toISOString());
    
    return data;
  } catch (error) {
    console.error(`Error fetching chart data for ${cryptoId}:`, error);
    return null;
  }
}

// API endpoint to get crypto data
app.get('/api/crypto', (req, res) => {
  if (cryptoData) {
    res.json(cryptoData);
  } else {
    fetchCryptoData()
      .then(data => {
        if (data) {
          res.json(data);
        } else {
          res.status(500).json({ error: 'Failed to fetch crypto data' });
        }
      })
      .catch(error => {
        console.error('Error in /api/crypto endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
      });
  }
});

// API endpoint to get chart data for a specific crypto
app.get('/api/chart/:cryptoId', (req, res) => {
  const cryptoId = req.params.cryptoId;
  
  if (chartData[cryptoId]) {
    res.json(chartData[cryptoId]);
  } else {
    fetchChartData(cryptoId)
      .then(data => {
        if (data) {
          res.json(data);
        } else {
          res.status(500).json({ error: `Failed to fetch chart data for ${cryptoId}` });
        }
      })
      .catch(error => {
        console.error(`Error in /api/chart/${cryptoId} endpoint:`, error);
        res.status(500).json({ error: 'Internal server error' });
      });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Send current data to the newly connected client
  if (cryptoData) {
    socket.emit('cryptoDataUpdate', cryptoData);
  }
  
  // Handle client requesting chart data
  socket.on('requestChartData', (cryptoId) => {
    if (chartData[cryptoId]) {
      socket.emit('chartDataUpdate', { cryptoId, data: chartData[cryptoId] });
    } else {
      fetchChartData(cryptoId)
        .then(data => {
          if (data) {
            socket.emit('chartDataUpdate', { cryptoId, data });
          }
        })
        .catch(error => {
          console.error(`Error fetching chart data for ${cryptoId}:`, error);
        });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Initial data fetch
fetchCryptoData();

// Refresh data every 1 minute
setInterval(fetchCryptoData, 60000);

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboardtailwind.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});