// import { retry } from "./utils/retry";

// async function unstableOperation(): Promise<string> {
//   const shouldFail = Math.random() < 0.7;
//   if (shouldFail) {
//     throw new Error("Transient failure occurred");
//   }
//   return "Operation successful!";
// }

// (async () => {
//   try {
//     console.log("Starting operation...");
//     const result = await retry(unstableOperation, 5, 500);
//     console.log(result);
//   } catch (error) {
//     console.error("Operation failed after retries:", error);
//   }
// })();

// import { createCache } from "./utils/cache";

// const cache = createCache();

// async function expensiveOperation(arg: string): Promise<string> {
//   await new Promise((resolve) => setTimeout(resolve, 1000));
//   return `Result for ${arg}`;
// }

// async function getCachedData(key: string): Promise<string> {
//   return (await cache.get(key, () => expensiveOperation(key), 5000))!;
// }

// (async () => {
//   await new Promise((resolve) => setTimeout(resolve, 3000));
//   console.log("\n--- Cache Example ---");

//   console.log(await getCachedData("test-key"));
//   console.log(await getCachedData("test-key"));

//   console.log("Waiting for cache to expire...");
//   await new Promise((resolve) => setTimeout(resolve, 6000));

//   console.log(await getCachedData("test-key"));
// })();

import app from "./server";

const API_PORT = 3001;
app.listen(API_PORT, () => {
  console.log(`\n--- API Integration ---`);
  console.log(
    `Express API with Rate Limiter running at http://localhost:${API_PORT}`,
  );
  console.log(`Try: curl http://localhost:${API_PORT}/api/data`);
});
