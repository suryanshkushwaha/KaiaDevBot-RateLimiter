const config = require("../config");
const { estimateTokens } = require("../services/tokenEstimator");
const {
  getRoomLimit,
  createRoomLimit,
  updateRoomLimit,
} = require("../db/queries");

const rateLimiter = (db) => async (req, res, next) => {
  const roomId = req.body.roomId;

  if (!roomId) {
    return res.status(400).json({ error: "Room ID is required in body" });
  }

  try {
    let roomLimit = await getRoomLimit(db, roomId);
    const now = Date.now();

    // If room doesn't exist, create new entry
    if (!roomLimit) {
      await createRoomLimit(db, roomId, config.initialTokens);
      roomLimit = {
        roomId,
        tokensRemaining: config.initialTokens,
        lastCalled: now,
      };
    }

    // Estimate tokens needed for this request
    const estimatedTokens = estimateTokens(req.body.text);

    // Check if enough tokens are available
    if (estimatedTokens > roomLimit.tokensRemaining) {
      const secondsSinceLastCall = (now - roomLimit.lastCalled) / 1000;
      const resetTimeInSeconds = config.resetHours * 3600;

      if (secondsSinceLastCall >= resetTimeInSeconds) {
        roomLimit.tokensRemaining = config.initialTokens;
        // Recheck token availability after reset
        if (estimatedTokens > roomLimit.tokensRemaining) {
          return res.status(429).json({
            error: `Not enough tokens available even after reset. Required: ${estimatedTokens}, Available: ${roomLimit.tokensRemaining}`,
            tokensRemaining: roomLimit.tokensRemaining,
            estimatedTokens: estimatedTokens,
          });
        }
      } else {
        const minutesRemaining = (
          (resetTimeInSeconds - secondsSinceLastCall) /
          60
        ).toFixed(1);
        return res.status(429).json({
          error: `Please wait ${minutesRemaining} minutes before making another call`,
          tokensRemaining: roomLimit.tokensRemaining,
          estimatedTokens: estimatedTokens,
        });
      }
    }

    // If we reach here, either we have enough tokens or they were reset
    // Update tokens and last called time
    roomLimit.tokensRemaining -= estimatedTokens;
    roomLimit.lastCalled = now;
    console.log("tokensRemaining", roomLimit.tokensRemaining);

    // Update room limit in database
    await updateRoomLimit(db, roomId, roomLimit.tokensRemaining, now);
    console.log("updated room limit");

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = rateLimiter;
