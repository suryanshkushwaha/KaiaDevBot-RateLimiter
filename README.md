# Rate Limiter Middleware

A Node.js rate limiting service that manages token-based request limits per room with automatic resets and request debouncing.

## Features

- Token-based rate limiting per room 
- Automatic token reset after configurable time period
- Request debouncing to prevent API abuse
- SQLite database for persistent storage
- Token estimation for requests and responses
- CORS support for specified origins
- Health check endpoint

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. [Optional] Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```
4. Start the server:
```bash
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| AGENT_ID | Agent identifier | NA |
| INITIAL_TOKENS | Initial token allocation per room | 10000 |
| RESET_HOURS | Hours before token count resets | 5 |
| PORT | Rate limiter service port | 3003 |
| TARGET_SERVER_PORT | Target API server port | 3000 |
<!-- | DEBOUNCE_WAIT | Request debounce wait time (ms) | 1000 | -->
| DB_PATH | SQLite database path | "./rate-limiter.db" |

## API Endpoints

### POST /message

Send messages through the rate limiter.

**Request Body:**
```json
{
  "text": "Your message",
  "roomId": "room-123"
}
```

**Responses:**
- `200` Success with response and remaining tokens
- `429` Rate limit exceeded
- `400` Missing room ID
- `502` Target API error

### GET /health

Health check endpoint returns service status.

## Development

Run in development mode with hot reload:
```bash
npm run dev
```

## Architecture

The service uses:
- Express.js for HTTP routing
- SQLite3 for token persistence
- Token-based rate limiting per room
- Automatic token resets
- Request debouncing

## Error Handling

- Graceful shutdown
- Input validation
- Detailed rate limit messages
- Database connection management

## Security

- CORS protection
- Input sanitization
- Prepared SQL queries

## Requirements

- Node.js 14+
- SQLite3
- npm or yarn