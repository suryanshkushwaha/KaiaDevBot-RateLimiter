const axios = require("axios");
const config = require("../config");

const forwardRequest = async (message, roomId) => {
  try {
    const response = await axios.post(
      `http://localhost:${config.serverPort}/${config.agentId}/message`,
      {
        text: message,
        roomId: roomId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Target API error: ${error.message}`);
  }
};

module.exports = { forwardRequest };
