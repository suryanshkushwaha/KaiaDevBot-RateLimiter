const axios = require('axios');
const config = require('../config');

const forwardRequest = async (message) => {
  try {
    console.log(`http://localhost:${config.serverPort}/${config.agentId}/message`,
      {
        "text": message,
        "userId": "user",
        "userName": "User"
      })
    const response = await axios.post(
      `http://localhost:${config.serverPort}/${config.agentId}/message`,
      {
        "text": message,
        "userId": "user",
        "userName": "User"
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Target API error: ${error.message}`);
  }
};

module.exports = { forwardRequest };