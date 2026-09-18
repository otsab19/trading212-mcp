# Trading 212 MCP Server

An MCP (Model Context Protocol) server that connects AI assistants to your Trading 212 account. View your portfolio, check balances, search instruments, browse order history, and optionally place trades — all through natural language.

**Works with:** Claude Desktop · Cursor · Antigravity IDE · ChatGPT · Gemini

## ✨ Features

| Category | Tools | Description |
|---|---|---|
| 📊 **Account** | `get_account_info`, `get_account_cash`, `get_account_summary` | View account details, cash balances, P&L |
| 🔍 **Instruments** | `search_instruments`, `get_exchanges` | Search stocks by ticker/name/ISIN, list exchanges |
| 📋 **Orders** | `list_pending_orders`, `place_market_order`, `place_limit_order`, `place_stop_order`, `place_stop_limit_order`, `cancel_order` | View and manage orders |
| 💼 **Portfolio** | `get_portfolio`, `get_position` | View all positions or a specific holding |
| 📜 **History** | `get_order_history`, `get_dividend_history`, `get_transaction_history` | Browse historical data with pagination |

## 🚀 Quick Start

### Prerequisites
1. A Trading 212 **Invest** or **Stocks ISA** account
2. Generate an API key: **Trading 212 App → Settings → API (Beta)**
3. Node.js 18+

### Run with npx
```bash
# Stdio mode (Claude Desktop / Cursor / Antigravity)
TRADING212_API_KEY=your_key npx trading212-mcp

# HTTP mode (ChatGPT / Gemini)
TRADING212_API_KEY=your_key TRADING212_TRANSPORT=http npx trading212-mcp
```

### Run locally
```bash
git clone https://github.com/your-username/mcp-tools.git
cd mcp-tools/trading212-mcp
npm install
npm run build

# Stdio mode (default)
TRADING212_API_KEY=your_key npm start

# HTTP mode
TRADING212_API_KEY=your_key npm run start:http
```

## ⚙️ Configuration

| Variable | Required | Default | Description |
|---|---|---|---|
| `TRADING212_API_KEY` | ✅ | — | Your Trading 212 API key |
| `TRADING212_ENV` | ❌ | `demo` | `demo` (paper trading) or `live` (real money) |
| `TRADING212_ALLOW_TRADING` | ❌ | `false` | Set to `true` to enable order placement |
| `TRADING212_TRANSPORT` | ❌ | `stdio` | `stdio` (local) or `http` (remote SSE server) |
| `PORT` | ❌ | `3212` | HTTP server port (only in http mode) |

## 🔌 Connect to Your AI

### Claude Desktop (stdio)
Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "trading212": {
      "command": "npx",
      "args": ["trading212-mcp"],
      "env": {
        "TRADING212_API_KEY": "your_api_key_here",
        "TRADING212_ENV": "demo"
      }
    }
  }
}
```

### Cursor (stdio)
Add to `.cursor/mcp.json` in your project:
```json
{
  "mcpServers": {
    "trading212": {
      "command": "npx",
      "args": ["trading212-mcp"],
      "env": {
        "TRADING212_API_KEY": "your_api_key_here",
        "TRADING212_ENV": "demo"
      }
    }
  }
}
```

### Antigravity IDE (stdio)
Add to your MCP configuration:
```json
{
  "mcpServers": {
    "trading212": {
      "command": "npx",
      "args": ["trading212-mcp"],
      "env": {
        "TRADING212_API_KEY": "your_api_key_here",
        "TRADING212_ENV": "demo"
      }
    }
  }
}
```

### ChatGPT (http — remote)

ChatGPT connects to **remote HTTPS MCP servers**. You'll need to:

1. **Start the server in HTTP mode** (locally or on a host):
   ```bash
   TRADING212_API_KEY=your_key TRADING212_TRANSPORT=http PORT=3212 npm start
   ```

2. **Expose it via HTTPS** — use one of these options:

   **Option A: ngrok (quickest for testing)**
   ```bash
   ngrok http 3212
   # This gives you a URL like https://abc123.ngrok.io
   ```

   **Option B: Cloudflare Tunnel (free, production-ready)**
   ```bash
   cloudflared tunnel --url http://localhost:3212
   ```

   **Option C: Deploy to a cloud host** (Render, Railway, Fly.io, etc.)

3. **Add to ChatGPT:**
   - Go to **Settings → Connectors** (or **Settings → MCP Servers**)
   - Click **Add custom connector**
   - Enter name: `Trading 212`
   - Enter URL: `https://your-domain.com/sse`
   - Save and connect

### Gemini (http — remote)

Google Gemini also requires remote HTTPS MCP servers.

1. **Start the server in HTTP mode** and expose via HTTPS (same as ChatGPT steps 1-2 above).

2. **Add to Gemini:**

   **Gemini Web (Consumer/Pro):**
   - Go to **Settings & help → Connected Apps**
   - Click **Add a custom app**
   - Enter your HTTPS MCP server URL: `https://your-domain.com/sse`
   - Requires a Gemini Spark/Pro/Ultra subscription

   **Gemini Enterprise:**
   - Go to **Team settings → Connected apps → Add MCP Server**
   - Enter the HTTPS URL

   **Gemini CLI:**
   Add to your `settings.json`:
   ```json
   {
     "mcpServers": {
       "trading212": {
         "command": "npx",
         "args": ["mcp-remote", "https://your-domain.com/sse"]
       }
     }
   }
   ```

### HTTP Endpoints (when running in http mode)

| Endpoint | Method | Description |
|---|---|---|
| `/sse` | `GET` | SSE stream — connect here to start an MCP session |
| `/messages?sessionId=xxx` | `POST` | Send JSON-RPC messages to the server |
| `/health` | `GET` | Health check (returns server status) |

## 🛡️ Safety

- **Default: read-only.** Order placement tools are disabled unless you explicitly set `TRADING212_ALLOW_TRADING=true`.
- **Default: demo mode.** Uses paper trading unless you set `TRADING212_ENV=live`.
- **Default: stdio.** No network exposure unless you explicitly set `TRADING212_TRANSPORT=http`.
- **Rate limited.** Respects Trading 212's per-account rate limits.

> ⚠️ **WARNING:** When `TRADING212_ALLOW_TRADING=true` and `TRADING212_ENV=live`, this tool can execute real trades with real money. Use with extreme caution.

> ⚠️ **SECURITY:** When exposing via HTTP, always use HTTPS and consider adding authentication. Never expose your Trading 212 API key publicly.

## 📖 Example Prompts

Once connected, try asking your AI:
- *"Show me my Trading 212 portfolio"*
- *"How much free cash do I have?"*
- *"Search for Apple stock on Trading 212"*
- *"Show me my dividend history"*
- *"What pending orders do I have?"*

## 🏗️ Tech Stack

Built following [Matt Pocock's AI Hero MCP patterns](https://www.aihero.dev):
- **TypeScript** with strict mode
- **@modelcontextprotocol/sdk** — official MCP SDK
- **Zod** — runtime input validation
- **Express** — HTTP/SSE transport for remote clients
- **Dual transport** — stdio + HTTP in one binary

## 📄 License

MIT

---

## ☁️ Free Deployment Options

You need to deploy as an HTTPS server for ChatGPT and Gemini. Here are the **free** options:

### Option 1: Render (Recommended — easiest)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo, point to the `trading212-mcp/` directory
4. Render will auto-detect the `Dockerfile`
5. Add environment variable: `TRADING212_API_KEY` = your key
6. Deploy — you'll get a free URL like `https://trading212-mcp-xxxx.onrender.com`
7. Use `https://trading212-mcp-xxxx.onrender.com/sse` as your MCP URL in ChatGPT/Gemini

> ⚠️ **Note:** Render free tier spins down after 15 min of inactivity (first request takes ~30s to wake up).

### Option 2: Railway

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. Set env vars in the Railway dashboard
4. Get your `*.up.railway.app` URL
5. Use `https://your-app.up.railway.app/sse` as your MCP URL

### Option 3: Fly.io

```bash
# Install flyctl
brew install flyctl

# From the trading212-mcp/ directory:
fly launch
fly secrets set TRADING212_API_KEY=your_key
fly deploy
```

### Option 4: Cloudflare Tunnel (run locally, expose free)

Keep the server on your Mac but expose it to the internet for free:
```bash
# Install cloudflared
brew install cloudflare/cloudflare/cloudflared

# Start your server
TRADING212_API_KEY=your_key TRADING212_TRANSPORT=http npm start

# In another terminal, create a tunnel
cloudflared tunnel --url http://localhost:3212
# Gives you: https://random-words.trycloudflare.com
# Use: https://random-words.trycloudflare.com/sse
```
