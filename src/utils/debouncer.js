const debounceMap = new Map();

const debounce = (key, func, wait) => {
  if (debounceMap.has(key)) {
    clearTimeout(debounceMap.get(key));
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(async () => {
      debounceMap.delete(key);
      try {
        const result = await func();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, wait);

    debounceMap.set(key, timeoutId);
  });
};

module.exports = { debounce };