const config = require("../config");
const { estimateTokens } = require("../utils/tokenEstimator");
const { debounce } = require("../utils/debouncer");
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
    // Wrap the main rate limiting logic in a debounce function
    const handleRequest = async () => {
      let roomLimit = await getRoomLimit(db, roomId);
      const now = Date.now();

      if (!roomLimit) {
        await createRoomLimit(db, roomId, config.initialTokens);
        roomLimit = {
          roomId,
          tokensRemaining: config.initialTokens,
          lastCalled: now,
        };
      }

      const estimatedTokens = estimateTokens(req.body.text);

      if (estimatedTokens > roomLimit.tokensRemaining) {
        const secondsSinceLastCall = (now - roomLimit.lastCalled) / 1000;
        const resetTimeInSeconds = config.resetHours * 3600;

        if (secondsSinceLastCall >= resetTimeInSeconds) {
          roomLimit.tokensRemaining = config.initialTokens;
          if (estimatedTokens > roomLimit.tokensRemaining) {
            return {
              status: 429,
              data: {
                error: `Not enough tokens available even after reset. Required: ${estimatedTokens}, Available: ${roomLimit.tokensRemaining}`,
                tokensRemaining: roomLimit.tokensRemaining,
                estimatedTokens: estimatedTokens,
              },
            };
          }
        } else {
          const minutesRemaining = Math.ceil(
            (resetTimeInSeconds - secondsSinceLastCall) /
            60
          ).toFixed(0);
          return {
            status: 429,
            data: {
              error: `Please wait ${minutesRemaining} minutes before making another call`,
              tokensRemaining: roomLimit.tokensRemaining,
              estimatedTokens: estimatedTokens,
            },
          };
        }
      }

      roomLimit.tokensRemaining -= estimatedTokens;
      roomLimit.lastCalled = now;
      await updateRoomLimit(db, roomId, roomLimit.tokensRemaining, now);

      return { status: 200 };
    };

    // Apply debouncing with a 1-second wait time
    const result = await debounce(
      `${roomId}`,
      handleRequest,
      config.debounceWait
    );

    if (result.status === 429) {
      return res.status(429).json(result.data);
    }

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = rateLimiter;
