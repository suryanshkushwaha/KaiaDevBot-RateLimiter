const { encode } = require("gpt-tokenizer");

function estimateTokens(text) {
  const tokens = encode(text);
  return tokens.length;
}

module.exports = { estimateTokens };
