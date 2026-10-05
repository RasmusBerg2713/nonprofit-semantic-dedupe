import { createServer } from "node:http";
import { findNearDuplicates, requestSchema } from "./semantic_dedupe.js";

const server = createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/dedupe") { res.writeHead(404).end(); return; }
  let body = "";
  for await (const chunk of req) body += chunk;
  try {
    const input = requestSchema.parse(JSON.parse(body));
    const result = await findNearDuplicates(input);
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid request";
    res.writeHead(400, { "content-type": "application/json" }).end(JSON.stringify({ error: message }));
  }
});

server.listen(8787, () => console.log("POST http://localhost:8787/dedupe"));
