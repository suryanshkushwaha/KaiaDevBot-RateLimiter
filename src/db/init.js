const sqlite3 = require("sqlite3").verbose();
const config = require("../config");
const path = require("path");
const fs = require("fs");

const initializeDatabase = () => {
  // Create data directory if it doesn't exist
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Update database path to be inside data directory
  const dbPath = path.join(dataDir, path.basename(config.dbPath));
  const db = new sqlite3.Database(dbPath);
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        roomId TEXT PRIMARY KEY,
        createdAt INTEGER,
        tokensRemaining INTEGER,
        lastCalled INTEGER
      )
    `);

    // Create index for faster lookups
    db.run(`
      CREATE INDEX IF NOT EXISTS idx_lastCalled 
      ON rate_limits(lastCalled)
    `);
  });

  return db;
};

module.exports = { initializeDatabase };
