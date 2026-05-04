# Financial Data API Documentation

This API provides real-time market data and historical financial data for predictive analytics.

## Base URL
`/api/financial`

## Authentication
All endpoints require a valid JWT token in the `x-auth-token` header.

## Rate Limiting
- **Limit**: 100 requests per 15 minutes per IP.
- **Headers**: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` are included in responses.

## Endpoints

### 1. Get Historical Data
Retrieves historical price data for a given symbol.

- **URL**: `/historical/:symbol`
- **Method**: `GET`
- **Query Parameters**:
  - `interval`: (Optional) `daily` (default) or `intraday`.
- **Response**: JSON array of candle objects.
  ```json
  [
    {
      "date": "2023-10-27",
      "open": 150.00,
      "high": 155.00,
      "low": 149.50,
      "close": 153.20,
      "volume": 1000000
    },
    ...
  ]
  ```

### 2. Get Real-Time Quote (Snapshot)
Retrieves the latest price snapshot for a symbol.

- **URL**: `/quote/:symbol`
- **Method**: `GET`
- **Response**: JSON object.
  ```json
  {
    "symbol": "AAPL",
    "price": 153.20,
    "change": 1.20,
    "percentChange": 0.79,
    "volume": 1000000,
    "timestamp": "2023-10-27T10:00:00.000Z"
  }
  ```

## WebSocket API
Connect to the root URL via `socket.io` client.

### Events

#### `subscribe`
Subscribe to real-time updates for a symbol.
- **Payload**: `symbol` (string, e.g., "AAPL")

#### `unsubscribe`
Unsubscribe from updates for a symbol.
- **Payload**: `symbol` (string)

#### `price_update` (Server -> Client)
Received when a price update occurs for a subscribed symbol.
- **Payload**:
  ```json
  {
    "symbol": "AAPL",
    "price": 153.25,
    "volume": 1000100,
    "timestamp": "2023-10-27T10:00:01.000Z",
    "type": "trade"
  }
  ```

## Data Sources
- **Alpha Vantage**: Used if `ALPHA_VANTAGE_API_KEY` is set in `.env`.
- **Simulation**: Fallback mechanism using random walk algorithm for testing and development.
