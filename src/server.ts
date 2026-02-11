import express from "express";
import { createApiRateLimiter } from "./utils/rate-limit-middleware";

const app = express();
const port = 3000;

const limiter = createApiRateLimiter(5, 10000);

app.get("/api/data", limiter, (req, res) => {
  res.json({
    message: "Success!",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to the Rate-Limited API Example. Visit /api/data to test.");
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

export default app;
