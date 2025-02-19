const express = require("express");
const cors = require("cors");
const { initializeDatabase } = require("./db/init");
const rateLimiter = require("./middleware/rateLimiter");
const { forwardRequest } = require("./services/apiService");
const config = require("./config");

const app = express();
const db = initializeDatabase();

// CORS options configuration
const corsOptions = {
  origin: "https://kaia.io", // Allow requests only from https://kaia.io
  methods: "GET,POST,PUT,DELETE", // You can customize allowed methods
  allowedHeaders: "Content-Type,Authorization", // You can customize allowed headers
};

// Apply CORS middleware to your Express app
app.use(cors(corsOptions));

app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Main endpoint with rate limiting
app.post("/message", rateLimiter(db), async (req, res) => {
  try {
    let { text, userId, userName } = req.body;

    const result = await forwardRequest(text);
    res.json(result);
  } catch (error) {
    console.error("Request forwarding error:", error);
    res.status(502).json({ error: "Error forwarding request to target API" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

app.listen(config.port, () => {
  console.log(`Rate limiter service running on port ${config.port}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  db.close(() => {
    console.log("Database connection closed");
    process.exit(0);
  });
});
