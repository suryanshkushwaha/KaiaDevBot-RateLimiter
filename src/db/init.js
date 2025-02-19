const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

const initializeDatabase = () => {
  const db = new sqlite3.Database(config.dbPath);

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