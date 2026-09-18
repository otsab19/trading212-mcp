#!/usr/bin/env node

/**
 * Trading 212 MCP Server — Entry Point
 *
 * Supports two transport modes:
 *   1. stdio  — for Claude Desktop, Cursor, Antigravity (default)
 *   2. http   — for ChatGPT, Gemini, and any remote MCP client
 *
 * Environment variables:
 *   TRADING212_API_KEY       - Your Trading 212 API key (required)
 *   TRADING212_ENV           - "demo" or "live" (default: "demo")
 *   TRADING212_ALLOW_TRADING - "true" to enable order placement (default: "false")
 *   TRADING212_TRANSPORT     - "stdio" or "http" (default: "stdio")
 *   PORT                     - HTTP server port (default: 3212, only used in http mode)
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { Trading212Client } from "./api/client.js";
import { createServer } from "./server.js";

// ─── Configuration ──────────────────────────────────────

const apiKey = process.env.TRADING212_API_KEY;

if (!apiKey) {
  process.stderr.write(
    "ERROR: TRADING212_API_KEY environment variable is required.\n" +
      "Generate your API key in the Trading 212 app: Settings → API (Beta)\n",
  );
  process.exit(1);
}

const environment =
  (process.env.TRADING212_ENV as "demo" | "live") || "demo";
const allowTrading =
  process.env.TRADING212_ALLOW_TRADING === "true";
const transportMode =
  (process.env.TRADING212_TRANSPORT as "stdio" | "http") || "stdio";
const port = parseInt(process.env.PORT || "3212", 10);

// ─── Startup ────────────────────────────────────────────

const client = new Trading212Client({ apiKey, environment });

process.stderr.write(
  `🚀 Trading 212 MCP Server starting...\n` +
    `   Environment: ${environment}\n` +
    `   Trading:     ${allowTrading ? "✅ ENABLED (order placement allowed)" : "🔒 DISABLED (read-only)"}\n` +
    `   Transport:   ${transportMode}\n`,
);

if (transportMode === "http") {
  // ─── HTTP / SSE Transport ───────────────────────────
  // Used by ChatGPT, Gemini, and remote MCP clients.
  // Exposes GET /sse (event stream) and POST /messages (client→server).

  const app = express();
  app.use(express.json());

  // Store active transports per session
  const transports = new Map<string, SSEServerTransport>();

  // Health check
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      server: "trading212-mcp",
      environment,
      trading: allowTrading,
    });
  });

  // SSE endpoint — client connects here to receive server→client messages
  app.get("/sse", async (req, res) => {
    const server = createServer(client, allowTrading);
    const transport = new SSEServerTransport("/messages", res);
    const sessionId = transport.sessionId;
    transports.set(sessionId, transport);

    // Clean up on disconnect
    req.on("close", () => {
      transports.delete(sessionId);
    });

    await server.connect(transport);
  });

  // Messages endpoint — client sends JSON-RPC messages here
  app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
      res.status(400).json({ error: "Missing sessionId query parameter" });
      return;
    }

    const transport = transports.get(sessionId);
    if (!transport) {
      res.status(404).json({ error: "Session not found. Connect to /sse first." });
      return;
    }

    await transport.handlePostMessage(req, res, req.body);
  });

  app.listen(port, () => {
    process.stderr.write(
      `\n🌐 HTTP server listening on port ${port}\n` +
        `   SSE endpoint:      http://localhost:${port}/sse\n` +
        `   Messages endpoint: http://localhost:${port}/messages\n` +
        `   Health check:      http://localhost:${port}/health\n\n` +
        `   For ChatGPT / Gemini, use the SSE URL as your MCP server endpoint.\n` +
        `   If deploying remotely, use HTTPS and add authentication.\n`,
    );
  });
} else {
  // ─── Stdio Transport ────────────────────────────────
  // Used by Claude Desktop, Cursor, Antigravity IDE.

  const server = createServer(client, allowTrading);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
