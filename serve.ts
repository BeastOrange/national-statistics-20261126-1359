import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { statSync, createReadStream, existsSync } from "node:fs";
import { resolve, join, normalize, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDir = resolve(__dirname, "app");

// CLI argument parsing for --port <port>
function parsePort(): number {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--port" && i + 1 < args.length) {
      const p = parseInt(args[i + 1], 10);
      if (!isNaN(p) && p > 0 && p < 65536) return p;
    }
  }
  if (process.env.PORT) {
    const p = parseInt(process.env.PORT, 10);
    if (!isNaN(p) && p > 0 && p < 65536) return p;
  }
  return 8080;
}

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

const port = parsePort();

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
    return;
  }

  let reqPath = "/";
  try {
    const parsed = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    reqPath = decodeURIComponent(parsed.pathname);
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Bad Request");
    return;
  }

  // Path resolution & traversal protection
  let normalized = normalize(reqPath);
  if (normalized.endsWith("/")) {
    normalized = join(normalized, "index.html");
  }

  const filePath = resolve(join(baseDir, normalized));

  // Must remain within baseDir
  if (!filePath.startsWith(baseDir)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
    return;
  }

  try {
    if (!existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }

    let stats = statSync(filePath);
    let targetPath = filePath;

    if (stats.isDirectory()) {
      targetPath = join(filePath, "index.html");
      if (!existsSync(targetPath)) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
        return;
      }
      stats = statSync(targetPath);
    }

    const ext = extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": stats.size,
      "Cache-Control": "no-cache"
    });

    if (req.method === "HEAD") {
      res.end();
      return;
    }

    createReadStream(targetPath).pipe(res);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
});

server.listen(port, () => {
  console.log(`StatAtlas static server running at http://localhost:${port}/ (serving ${baseDir})`);
});
