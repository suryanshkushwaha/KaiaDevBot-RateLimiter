const config = require("../config");
const { estimateTokens } = require("../utils/tokenEstimator");
// const { debounce } = require("../utils/debouncer");
const { getRoom, createRoom, updateRoom } = require("../db/queries");

const rateLimiter = (db) => async (req, res, next) => {
  const roomId = req.body.roomId;

  if (!roomId) {
    return res.status(400).json({ error: "Room ID is required in body" });
  }

  try {
    
    const handleRequest = async () => {
      let room = await getRoom(db, roomId);
      const now = Date.now();

      if (!room) {
        await createRoom(db, roomId, config.initialTokens);
        room = {
          roomId,
          tokensRemaining: config.initialTokens,
          lastCalled: now,
        };
      }

      const estimatedTokens = estimateTokens(req.body.text);

      if (estimatedTokens > room.tokensRemaining) {
        const secondsSinceLastCall = (now - room.lastCalled) / 1000;
        const resetTimeInSeconds = config.resetHours * 3600;

        if (secondsSinceLastCall >= resetTimeInSeconds) {
          room.tokensRemaining = config.initialTokens;
          if (estimatedTokens > room.tokensRemaining) {
            return {
              status: 429,
              data: {
                error: `Not enough tokens available even after reset. Required: ${estimatedTokens}, Available: ${room.tokensRemaining}`,
                tokensRemaining: room.tokensRemaining,
                estimatedTokens: estimatedTokens,
              },
            };
          }
        } else {
          const minutesRemaining = Math.ceil(
            (resetTimeInSeconds - secondsSinceLastCall) / 60
          ).toFixed(0);
          return {
            status: 429,
            data: {
              error: `Please wait ${minutesRemaining} minutes before making another call`,
              tokensRemaining: room.tokensRemaining,
              estimatedTokens: estimatedTokens,
            },
          };
        }
      }

      room.tokensRemaining -= estimatedTokens;
      room.lastCalled = now;
      await updateRoom(db, roomId, room.tokensRemaining, now);

      return { status: 200 };
    };

    // Apply debouncing with a 1-second wait time
    // const result = await debounce(
    //   `${roomId}`,
    //   handleRequest,
    //   config.debounceWait
    // );

    const result = await handleRequest();

    if (result.status === 429) {
      return res.status(429).json(result.data);
    }

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Deduct response tokens from the tokens remaining in the room
const deductResponseTokens = async (db, roomId, resultText) => {
  const tokens = estimateTokens(resultText);
  const room = await getRoom(db, roomId);
  if (room) {
    const newTokens = room.tokensRemaining - tokens;
    await updateRoom(db, roomId, newTokens);
    return newTokens;
  }
  return 0;
};

module.exports = { rateLimiter, deductResponseTokens };
