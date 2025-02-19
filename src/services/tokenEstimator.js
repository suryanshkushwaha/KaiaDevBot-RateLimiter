const { encode } = require('gpt-tokenizer');

function estimateTokens(text) {
  // Returns array of token integers
  const tokens = encode(text);
  return tokens.length;
}

// // Example usage
// const sentence = "Hello, how are you doing today?";
// console.log(`Token count: ${countTokens(sentence)}`);


module.exports = { estimateTokens };