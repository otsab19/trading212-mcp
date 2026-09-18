# Trading 212 MCP Server — Implementation Plan

## Background & Motivation

eToro provides an official MCP connector (`https://mcp.public-api.etoro.com`) that lets AI assistants like Claude interact with eToro accounts directly. **Trading 212 has no such MCP server.** This project fills that gap by building a community MCP server for the Trading 212 Public API (v0, beta).

We'll follow **Matt Pocock's AI Hero MCP patterns**:
- TypeScript-first, using the official `@modelcontextprotocol/sdk` package
- Stdio transport (for Claude Desktop, Cursor, Antigravity, etc.)
- Clean tool definitions with Zod schemas
- No `console.log` (breaks the JSON-RPC protocol stream)
- Distributable via NPX (`npx trading212-mcp`)

---

## Trading 212 API Reference

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Account** | `GET` | `/api/v0/equity/account/info` | Account metadata (id, currency) |
| **Account** | `GET` | `/api/v0/equity/account/cash` | Free cash, total, blocked, invested |
| **Account** | `GET` | `/api/v0/equity/account/summary` | Full account summary |
| **Instruments** | `GET` | `/api/v0/equity/metadata/instruments` | List all tradable instruments |
| **Instruments** | `GET` | `/api/v0/equity/metadata/exchanges` | List exchanges |
| **Orders** | `GET` | `/api/v0/equity/orders` | List pending orders |
| **Orders** | `POST` | `/api/v0/equity/orders/market` | Place market order |
| **Orders** | `POST` | `/api/v0/equity/orders/limit` | Place limit order |
| **Orders** | `POST` | `/api/v0/equity/orders/stop` | Place stop order |
| **Orders** | `POST` | `/api/v0/equity/orders/stop_limit` | Place stop-limit order |
| **Orders** | `DELETE` | `/api/v0/equity/orders/{id}` | Cancel pending order |
| **Positions** | `GET` | `/api/v0/equity/portfolio` | All open positions |
| **Positions** | `GET` | `/api/v0/equity/portfolio/{ticker}` | Position by ticker |
| **History** | `GET` | `/api/v0/equity/history/orders` | Historical orders (paginated) |
| **History** | `GET` | `/api/v0/equity/history/dividends` | Dividend history (paginated) |
| **History** | `GET` | `/api/v0/equity/history/transactions` | Transaction history (paginated) |

**Environments:**
- Demo: `https://demo.trading212.com`
- Live: `https://live.trading212.com`

**Auth:** API key passed via `Authorization` header as a Bearer token.

**Rate Limiting:** Per-account, tracked via `x-ratelimit-reset` / `x-ratelimit-used` headers.

---

## Proposed Architecture

```
mcp-tools/
├── trading212-mcp/
│   ├── src/
│   │   ├── index.ts              # Entry point, MCP server setup
│   │   ├── server.ts             # Server definition & tool registration
│   │   ├── tools/
│   │   │   ├── account.ts        # get_account_info, get_cash, get_summary
│   │   │   ├── instruments.ts    # search_instruments, get_exchanges
│   │   │   ├── orders.ts         # list_orders, place_order, cancel_order
│   │   │   ├── positions.ts      # get_portfolio, get_position
│   │   │   └── history.ts        # order_history, dividends, transactions
│   │   ├── api/
│   │   │   └── client.ts         # HTTP client wrapper with rate limiting
│   │   └── utils/
│   │       ├── schemas.ts        # Zod schemas for all inputs
│   │       └── errors.ts         # Error handling utilities
│   ├── package.json
│   ├── tsconfig.json
│   ├── README.md
│   └── .env.example
├── .gitignore
├── LICENSE
└── README.md                     # Root README (monorepo overview)
```

---

## Proposed Changes

### Phase 1: Project Scaffolding

#### [NEW] `trading212-mcp/package.json`
- Name: `trading212-mcp`
- Dependencies: `@modelcontextprotocol/sdk`, `zod`
- Dev dependencies: `typescript`, `tsx`, `@types/node`
- Scripts: `dev`, `build`, `start`
- `bin` field for `npx` distribution

#### [NEW] `trading212-mcp/tsconfig.json`
- Target: ES2022, Module: Node16
- Strict mode enabled

#### [NEW] `.gitignore`
- Standard Node/TS ignores (`node_modules`, `dist`, `.env`)

#### [NEW] `trading212-mcp/.env.example`
```
TRADING212_API_KEY=your_api_key_here
TRADING212_ENV=demo   # "demo" or "live"
```

---

### Phase 2: Core API Client

#### [NEW] `trading212-mcp/src/api/client.ts`
- `Trading212Client` class
- Configurable base URL (demo vs live)
- API key auth via `Authorization` header
- Rate limit tracking from response headers
- Typed GET/POST/DELETE methods
- Error wrapping with meaningful messages

---

### Phase 3: MCP Tool Definitions

Following Matt Pocock's pattern: each tool has a **name**, **description**, and **Zod input schema**.

#### [NEW] `trading212-mcp/src/tools/account.ts`
| Tool Name | Description | Inputs |
|---|---|---|
| `get_account_info` | Get account metadata (ID, currency type) | None |
| `get_account_cash` | Get cash balances (free, total, blocked, invested, P&L) | None |
| `get_account_summary` | Full account summary with all financial details | None |

#### [NEW] `trading212-mcp/src/tools/instruments.ts`
| Tool Name | Description | Inputs |
|---|---|---|
| `search_instruments` | Search tradable instruments by name or ticker | `query: string` |
| `get_exchanges` | List all available exchanges | None |

#### [NEW] `trading212-mcp/src/tools/orders.ts`
| Tool Name | Description | Inputs |
|---|---|---|
| `list_pending_orders` | Get all pending/unfilled orders | None |
| `place_market_order` | Place a market order (buy/sell) | `ticker, quantity` |
| `place_limit_order` | Place a limit order | `ticker, quantity, limitPrice, timeValidity` |
| `place_stop_order` | Place a stop order | `ticker, quantity, stopPrice, timeValidity` |
| `place_stop_limit_order` | Place a stop-limit order | `ticker, quantity, stopPrice, limitPrice, timeValidity` |
| `cancel_order` | Cancel a pending order by ID | `orderId` |

> ⚠️ **WARNING**
> Order placement tools (market, limit, stop, stop-limit) interact with real money on the live environment. We should implement a **confirmation prompt** and clearly document the risk. Consider adding a `--read-only` flag to disable write operations by default.

#### [NEW] `trading212-mcp/src/tools/positions.ts`
| Tool Name | Description | Inputs |
|---|---|---|
| `get_portfolio` | Get all open positions with current P&L | None |
| `get_position` | Get a specific position by ticker | `ticker: string` |

#### [NEW] `trading212-mcp/src/tools/history.ts`
| Tool Name | Description | Inputs |
|---|---|---|
| `get_order_history` | Paginated historical orders | `cursor?, limit?` |
| `get_dividend_history` | Paginated dividend payments | `cursor?, limit?` |
| `get_transaction_history` | Paginated transactions (deposits, withdrawals) | `cursor?, limit?` |

---

### Phase 4: Server Assembly

#### [NEW] `trading212-mcp/src/server.ts`
- Create MCP server instance using `@modelcontextprotocol/sdk`
- Register all tools from the `tools/` directory
- Handle tool dispatch

#### [NEW] `trading212-mcp/src/index.ts`
- Parse environment variables (API key, environment)
- Initialize the API client
- Start the MCP server over stdio transport
- Shebang line for `npx` execution: `#!/usr/bin/env node`

---

### Phase 5: Documentation & Distribution

#### [NEW] `trading212-mcp/README.md`
- What it does
- Quick start with `npx`
- Configuration (API key setup in Trading 212 app)
- Tool reference table
- Claude Desktop / Cursor / Antigravity config examples
- Safety warnings for live trading

#### [NEW] Root `README.md`
- Monorepo overview
- Links to individual MCP tools

---

## User Review Required

> 🔴 **IMPORTANT: Read-only vs. Read-write mode**
> Should we ship with order placement enabled by default, or require an explicit `--allow-trading` flag to unlock write operations? This is a safety concern since the MCP tool connects to real money.

> 🔴 **IMPORTANT: Demo vs Live default**
> Should the default environment be `demo` (paper trading) to prevent accidental live trades?

---

## Open Questions

1. **Do you have a Trading 212 API key already?** We'll need one to test against the demo environment.
2. **NPM publishing:** Do you want to publish this to NPM right away, or keep it local first?
3. **Monorepo scope:** The `mcp-tools/` repo is structured as a monorepo — are you planning to add more MCP tools here later (e.g., the ones suggested below)?

---

## Verification Plan

### Automated Tests
- Unit tests for the API client (mocked HTTP responses)
- Integration tests against the demo environment
- Zod schema validation tests

### Manual Verification
- Connect to Claude Desktop / Antigravity and verify tool discovery
- Run each tool against the demo environment
- Test rate limit handling
- Test error scenarios (invalid API key, network errors)

---

## 💡 MCP Tool Suggestions for Daily Use

Here are curated MCP tools worth installing for your daily workflow:

### 🔧 Developer Essentials

| MCP Server | What It Does | Why It's Useful |
|---|---|---|
| **GitHub MCP** | Browse repos, manage issues/PRs, trigger Actions | The #1 most used MCP — manage your repos without leaving your AI |
| **Context7** | Live, version-specific library docs | Prevents AI from hallucinating outdated API patterns |
| **Playwright MCP** | Browser automation, E2E testing, web scraping | Let your AI interact with web pages directly |
| **Sentry MCP** | Real-time error logs and stack traces | AI-driven debugging — feed errors directly to your agent |

### 📊 Finance & Trading

| MCP Server | What It Does | Why It's Useful |
|---|---|---|
| **eToro MCP** | Portfolio management, market research, trading | Official eToro integration — the inspiration for this project |
| **Trading 212 MCP** ⭐ | *This project!* Portfolio, orders, history | Fill the gap that eToro has but T212 doesn't |

### 📋 Productivity & Workflow

| MCP Server | What It Does | Why It's Useful |
|---|---|---|
| **Notion MCP** | Read/write Notion pages, databases, blocks | Manage your knowledge base, meeting notes, project docs |
| **Linear MCP** | File/update/triage issues | Project management without tab-switching |
| **Slack MCP** | Interact with team discussions, summarize threads | Stay in flow while keeping up with team comms |
| **Zapier MCP** | Connect to 6000+ apps (Sheets, CRMs, email) | The universal bridge for tools without native MCP support |

### 🔍 Research & Web

| MCP Server | What It Does | Why It's Useful |
|---|---|---|
| **Firecrawl MCP** | Search, scrape, parse websites into markdown | Best-in-class web context for your AI |
| **Tavily / Perplexity MCP** | AI-optimized search with reasoning | Better than raw Google — synthesized answers |

### 🗄️ Data & Infrastructure

| MCP Server | What It Does | Why It's Useful |
|---|---|---|
| **Supabase / PostgreSQL MCP** | Database access, schema management, queries | Natural language SQL queries and migrations |
| **Filesystem MCP** | Local file read/write/search | Let your AI work with your local files |

> 💡 **TIP: Start with 3–5 servers max.** Too many servers bloat the AI's context window and degrade performance. A good starter pack: **GitHub + Context7 + Firecrawl + Filesystem** + your domain-specific tool (Trading 212 MCP!).

---

## Tech Stack Summary (Following Matt Pocock's AI Hero Patterns)

| Technology | Purpose |
|---|---|
| **TypeScript** | Primary language |
| **`@modelcontextprotocol/sdk`** | Official MCP SDK for server creation |
| **Zod** | Runtime input validation & schema definitions |
| **tsx** | Dev-time TypeScript execution |
| **stdio transport** | Standard MCP transport for IDE/AI integration |
| **`npx` distribution** | Zero-install execution via NPM |
