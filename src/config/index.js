require("dotenv").config();

const config = {
  initialTokens: parseInt(process.env.INITIAL_TOKENS || "10000"),
  resetHours: parseFloat(process.env.RESET_HOURS || "5"),
  serverPort: process.env.TARGET_SERVER_PORT || "3000",
  agentId: process.env.AGENT_ID || "default",
  port: process.env.PORT || "4000",
  dbPath: process.env.DB_PATH || "./rate-limiter.db",
};

module.exports = config;
