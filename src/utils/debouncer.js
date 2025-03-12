// const debounceMap = new Map();
// const executionMap = new Map();

// const debounce = (key, func, wait) => {
//   // If this is the first request for this key, execute immediately
//   if (!executionMap.has(key)) {
//     executionMap.set(key, Date.now());
//     return func();
//   }

//   // For subsequent requests, apply debouncing
//   if (debounceMap.has(key)) {
//     clearTimeout(debounceMap.get(key));
//   }

//   return new Promise((resolve, reject) => {
//     const timeoutId = setTimeout(async () => {
//       debounceMap.delete(key);
//       try {
//         const result = await func();
//         resolve(result);
//       } catch (error) {
//         reject(error);
//       }
//     }, wait);

//     debounceMap.set(key, timeoutId);
//   });
// };

// // Add a cleanup method to reset execution state
// const resetDebounce = (key) => {
//   if (debounceMap.has(key)) {
//     clearTimeout(debounceMap.get(key));
//     debounceMap.delete(key);
//   }
//   executionMap.delete(key);
// };

// // Optional: Add auto-cleanup after some time
// const cleanupAfterInactivity = (key, inactivityTime = 1800000) => {
//   // default 30 minutes
//   setTimeout(() => {
//     if (executionMap.has(key)) {
//       resetDebounce(key);
//     }
//   }, inactivityTime);
// };

// module.exports = { debounce, resetDebounce };
