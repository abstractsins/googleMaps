import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs";
import livereload from "livereload";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MAPS_API_KEY = process.env.MAPS_API_KEY || "";
const isDev = process.env.NODE_ENV !== "production";
console.log("Using MAPS_API_KEY:", MAPS_API_KEY);

if (isDev) {
  const liveReloadServer = livereload.createServer({
    exts: ["html", "css", "js"],
    delay: 100,
  });
  liveReloadServer.watch(__dirname);

  liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
      liveReloadServer.refresh("/");
    }, 100);
  });
}

// Basic request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Inject MAPS_API_KEY into index.html at request time
app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "index.html");
  const html = fs.readFileSync(indexPath, "utf8");
  const liveReloadScript = isDev
    ? '\n    <script src="http://localhost:35729/livereload.js?snipver=1"></script>'
    : "";
  const output = html
    .replaceAll("__MAPS_API_KEY__", MAPS_API_KEY)
    .replace("</body>", `${liveReloadScript}\n  </body>`);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(output);
});

// Serve static assets (css, js, etc.) without auto-index
app.use(express.static(__dirname, { index: false }));

app.listen(PORT, () => {
  console.log(`
    -=0-=0-=0-=0-=0-=0-=0-=0==============0=-0=-0=-0=-0=-0=-0=-0=-
     |                                                          |
     |         Server running on http://localhost:${PORT}          |
     |                                                          |
    -=0-=0-=0-=0-=0-=0-=0-=0==============0=-0=-0=-0=-0=-0=-0=-0=-
    `);
});
