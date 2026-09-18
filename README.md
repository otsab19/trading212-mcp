# Trading 212 MCP Server

An MCP (Model Context Protocol) server that connects AI assistants to your Trading 212 account. View your portfolio, check balances, search instruments, view order history, and place orders directly from AI interfaces.

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
git clone https://github.com/otsab19/trading212-mcp.git
cd trading212-mcp
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

1. **Start the server in HTTP mode** (locally or on a cloud host):
   ```bash
   TRADING212_API_KEY=your_key TRADING212_TRANSPORT=http PORT=3212 npm start
   ```

2. **Expose it via HTTPS** — see free deployment options below or use a quick tunnel:

   **Option A: Cloudflare Tunnel (free, zero latency, no sleep)**
   ```bash
   cloudflared tunnel --url http://localhost:3212
   ```

   **Option B: ngrok (quick test)**
   ```bash
   ngrok http 3212
   ```

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

## ☁️ Free "No-Sleep" Deployment Options

ChatGPT and Gemini require an always-on remote HTTPS server. Here are the best **free** hosting solutions that avoid cold-start delays:

### Option 1: Koyeb (Recommended — Free Always-On, No Sleep)

[Koyeb](https://koyeb.com) provides a free **Nano instance** (512MB RAM, 0.1 vCPU) that **never sleeps** or spins down.

1. Create a free account at [koyeb.com](https://koyeb.com)
2. Click **Create Service** → Select **GitHub**
3. Select this repository (`trading212-mcp`)
4. Build type: **Dockerfile**
5. Add Environment Variables:
   - `TRADING212_API_KEY` = your API key
   - `TRADING212_ENV` = `demo` (or `live`)
   - `TRADING212_TRANSPORT` = `http`
   - `PORT` = `3212`
6. Deploy — Koyeb provides a free HTTPS domain (e.g. `https://xxx.koyeb.app`)
7. Your MCP SSE URL is: `https://xxx.koyeb.app/sse`

---

### Option 2: Render with Keep-Alive Ping (Free 24/7)

Render's free web service spins down after 15 minutes of inactivity. However, you can prevent it from ever sleeping for free:

1. Deploy to [render.com](https://render.com) using the included `Dockerfile`
2. Set env vars: `TRADING212_API_KEY`, `TRADING212_TRANSPORT=http`, `PORT=3212`
3. Get your Render URL (e.g. `https://trading212-mcp.onrender.com`)
4. **Prevent Sleep:** Set up a free monitor on [cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com) to ping `https://trading212-mcp.onrender.com/health` every **5 to 10 minutes**.
5. Render's 750 free monthly hours cover 24/7 uptime for the whole month.

---

### Option 3: Cloudflare Tunnel (`cloudflared` on local Mac/PC)

If you already run a computer or home server (Raspberry Pi/Mac mini), Cloudflare Tunnel exposes your local server to the internet over secure HTTPS for free:

```bash
# Install cloudflared
brew install cloudflare/cloudflare/cloudflared

# Start your local server in HTTP mode
TRADING212_API_KEY=your_key TRADING212_TRANSPORT=http npm start

# In a separate terminal, create a free public HTTPS tunnel
cloudflared tunnel --url http://localhost:3212
```
Use the output URL (`https://xxx.trycloudflare.com/sse`) in ChatGPT or Gemini.

---

### Option 4: Oracle Cloud "Always Free" VPS

Oracle Cloud offers a completely free, 24/7 persistent Linux VM (4 ARM cores, 24GB RAM) with no sleep or inactivity timeouts:

1. Create an **Oracle Cloud Always Free** account
2. Launch a Ubuntu VM
3. Install Docker: `sudo apt update && sudo apt install docker.io -y`
4. Run your container:
   ```bash
   docker run -d \
     -p 80:3212 \
     -e TRADING212_API_KEY="your_key" \
     -e TRADING212_TRANSPORT="http" \
     -e PORT="3212" \
     --name trading212-mcp \
     otsab19/trading212-mcp
   ```

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
