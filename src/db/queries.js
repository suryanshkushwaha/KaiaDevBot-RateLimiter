const getRoomLimit = (db, roomId) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM rate_limits WHERE roomId = ?',
      [roomId],
      (err, row) => {
        if (err) reject(err);
        resolve(row);
      }
    );
  });
};

const createRoomLimit = (db, roomId, tokens) => {
  const now = Date.now();
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO rate_limits (roomId, createdAt, tokensRemaining, lastCalled)
       VALUES (?, ?, ?, ?)`,
      [roomId, now, tokens, now],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
};

const updateRoomLimit = (db, roomId, tokensRemaining) => {
  const now = Date.now();
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE rate_limits 
       SET tokensRemaining = ?, lastCalled = ?
       WHERE roomId = ?`,
      [tokensRemaining, now, roomId],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
};

module.exports = {
  getRoomLimit,
  createRoomLimit,
  updateRoomLimit
}; 