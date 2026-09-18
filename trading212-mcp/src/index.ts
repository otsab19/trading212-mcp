#!/usr/bin/env node

/**
 * Trading 212 MCP Server — Entry Point
 *
 * Parses configuration from environment variables and starts
 * the MCP server over stdio transport.
 *
 * Environment variables:
 *   TRADING212_API_KEY       - Your Trading 212 API key (required)
 *   TRADING212_ENV           - "demo" or "live" (default: "demo")
 *   TRADING212_ALLOW_TRADING - "true" to enable order placement (default: "false")
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Trading212Client } from "./api/client.js";
import { createServer } from "./server.js";

// ─── Configuration ──────────────────────────────────────

const apiKey = process.env.TRADING212_API_KEY;

if (!apiKey) {
  // Use stderr for diagnostics — stdout is reserved for the MCP JSON-RPC stream
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

// ─── Startup ────────────────────────────────────────────

const client = new Trading212Client({ apiKey, environment });
const server = createServer(client, allowTrading);

// Log to stderr (safe — does not interfere with MCP protocol)
process.stderr.write(
  `🚀 Trading 212 MCP Server starting...\n` +
    `   Environment: ${environment}\n` +
    `   Trading:     ${allowTrading ? "✅ ENABLED (order placement allowed)" : "🔒 DISABLED (read-only)"}\n`,
);

// Connect via stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
