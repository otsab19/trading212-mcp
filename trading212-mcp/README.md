# Trading 212 MCP Server

An MCP (Model Context Protocol) server that connects AI assistants like Claude, Cursor, and Antigravity to your Trading 212 account. View your portfolio, check balances, search instruments, browse order history, and optionally place trades — all through natural language.

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

### Run with npx (no install needed)
```bash
TRADING212_API_KEY=your_key npx trading212-mcp
```

### Run locally
```bash
git clone https://github.com/your-username/mcp-tools.git
cd mcp-tools/trading212-mcp
npm install
npm run build

# Run in demo mode (default, safe)
TRADING212_API_KEY=your_key npm start

# Run with trading enabled
TRADING212_API_KEY=your_key TRADING212_ALLOW_TRADING=true npm start
```

## ⚙️ Configuration

| Variable | Required | Default | Description |
|---|---|---|---|
| `TRADING212_API_KEY` | ✅ | — | Your Trading 212 API key |
| `TRADING212_ENV` | ❌ | `demo` | `demo` (paper trading) or `live` (real money) |
| `TRADING212_ALLOW_TRADING` | ❌ | `false` | Set to `true` to enable order placement |

## 🔌 Connect to Your AI

### Claude Desktop
Add to your `claude_desktop_config.json`:
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

### Cursor
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

### Antigravity IDE
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

## 🛡️ Safety

- **Default: read-only.** Order placement tools are disabled unless you explicitly set `TRADING212_ALLOW_TRADING=true`.
- **Default: demo mode.** Uses paper trading unless you set `TRADING212_ENV=live`.
- **Rate limited.** Respects Trading 212's per-account rate limits.
- **No console.log.** All diagnostics go to stderr to keep the MCP JSON-RPC protocol stream clean.

> ⚠️ **WARNING:** When `TRADING212_ALLOW_TRADING=true` and `TRADING212_ENV=live`, this tool can execute real trades with real money. Use with extreme caution.

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
- **stdio transport** — standard MCP communication

## 📄 License

MIT
