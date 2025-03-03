# Crypto Movement Dashboard

A dashboard built with Tailwind CSS and Fusion Charts to show cryptocurrency movements in real-time. The application uses a Node.js backend to fetch and cache data from the CoinGecko API, and provides real-time updates to the frontend using WebSockets.

## Features

- Real-time cryptocurrency price updates
- Interactive price charts
- WebSocket-based auto-refresh
- Backend caching to reduce API calls
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: HTML, JavaScript, Tailwind CSS, Fusion Charts
- **Backend**: Node.js, Express.js
- **Real-time Updates**: Socket.IO
- **Data Source**: CoinGecko API

## Setup and Installation

1. Make sure you have Node.js installed (version 12 or higher)
2. Clone this repository
3. Install dependencies:
   ```
   npm install
   ```
4. Start the server:
   ```
   npm start
   ```
5. Open your browser and navigate to `http://localhost:3000`

## How It Works

The application consists of two main components:

### Backend (server.js)

- Fetches cryptocurrency data from the CoinGecko API
- Caches the data in memory
- Provides REST API endpoints for the frontend
- Implements WebSockets for real-time updates
- Auto-refreshes data every minute

### Frontend (dashboardtailwind.html)

- Displays cryptocurrency cards with current prices and 24h changes
- Shows an interactive chart for the selected cryptocurrency
- Receives real-time updates via WebSockets
- Falls back to REST API if WebSockets are not available

## API Endpoints

- `GET /api/crypto` - Returns current data for all cryptocurrencies
- `GET /api/chart/:cryptoId` - Returns 7-day price history for a specific cryptocurrency

## WebSocket Events

- `cryptoDataUpdate` - Emitted when new cryptocurrency data is available
- `chartDataUpdate` - Emitted when new chart data is available for a specific cryptocurrency
- `requestChartData` - Client event to request chart data for a specific cryptocurrency

## Data Source

The application uses the [CoinGecko API](https://api.coingecko.com) to fetch cryptocurrency data.