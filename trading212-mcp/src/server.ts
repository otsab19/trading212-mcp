/**
 * Trading 212 MCP Server
 *
 * Registers all tools and handles dispatch.
 * Following Matt Pocock's AI Hero MCP pattern:
 * - Each tool has a name, description, and Zod input schema
 * - No console.log (breaks JSON-RPC protocol stream)
 * - Clean error handling with user-friendly messages
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Trading212Client } from "./api/client.js";
import { formatErrorResponse } from "./utils/errors.js";

// Schemas
import {
  EmptyInput,
  SearchInstrumentsInput,
  PlaceMarketOrderInput,
  PlaceLimitOrderInput,
  PlaceStopOrderInput,
  PlaceStopLimitOrderInput,
  CancelOrderInput,
  GetPositionInput,
  HistoryInput,
} from "./utils/schemas.js";

// Tool handlers
import {
  getAccountInfo,
  getAccountCash,
  getAccountSummary,
} from "./tools/account.js";
import { searchInstruments, getExchanges } from "./tools/instruments.js";
import {
  listPendingOrders,
  placeMarketOrder,
  placeLimitOrder,
  placeStopOrder,
  placeStopLimitOrder,
  cancelOrder,
} from "./tools/orders.js";
import { getPortfolio, getPosition } from "./tools/positions.js";
import {
  getOrderHistory,
  getDividendHistory,
  getTransactionHistory,
} from "./tools/history.js";

// ─── Server Factory ─────────────────────────────────────

export function createServer(
  client: Trading212Client,
  allowTrading: boolean,
): McpServer {
  const server = new McpServer({
    name: "trading212-mcp",
    version: "0.1.0",
  });

  // ─── Account Tools ──────────────────────────────────

  server.tool(
    "get_account_info",
    "Get Trading 212 account metadata including account ID and base currency",
    EmptyInput.shape,
    async () => {
      try {
        const result = await getAccountInfo(client);
        return { content: [{ type: "text" as const, text: result }] };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: formatErrorResponse(error) }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "get_account_cash",
    "Get Trading 212 cash balances: free cash, total, invested, profit/loss, blocked funds",
    EmptyInput.shape,
    async () => {
      try {
        const result = await getAccountCash(client);
        return { content: [{ type: "text" as const, text: result }] };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: formatErrorResponse(error) }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "get_account_summary",
    "Get a comprehensive Trading 212 account summary with all account details and balances",
    EmptyInput.shape,
    async () => {
      try {
        const result = await getAccountSummary(client);
        return { content: [{ type: "text" as const, text: result }] };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: formatErrorResponse(error) }],
          isError: true,
        };
      }
    },
  );

  // ─── Instrument Tools ───────────────────────────────

  server.tool(
    "search_instruments",
    "Search Trading 212 instruments by ticker symbol, company name, or ISIN. Returns matching instruments with details.",
    SearchInstrumentsInput.shape,
    async ({ query }) => {
      try {
        const result = await searchInstruments(client, query);
        return { content: [{ type: "text" as const, text: result }] };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: formatErrorResponse(error) }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "get_exchanges",
    "List all available exchanges on Trading 212",
    EmptyInput.shape,
    async () => {
      try {
        const result = await getExchanges(client);
        return { content: [{ type: "text" as const, text: result }] };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: formatErrorResponse(error) }],
          isError: true,
        };
      }
    },
  );

  // ─── Order Tools ────────────────────────────────────

  server.tool(
    "list_pending_orders",
    "List all pending (unfilled) orders on Trading 212",
    EmptyInput.shape,
    async () => {
      try {
        const result = await listPendingOrders(client);
        return { content: [{ type: "text" as const, text: result }] };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: formatErrorResponse(error) }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "place_market_order",
    "⚠️ Place a MARKET order on Trading 212. Positive quantity = BUY, negative = SELL. Requires TRADING212_ALLOW_TRADING=true. Executes immediately at current market price.",
    PlaceMarketOrderInput.shape,
    async ({ ticker, quantity }) => {
      try {
        const result = await placeMarketOrder(
          client,
          allowTrading,
          ticker,
          quantity,
        );
        return { content: [{ type: "text" as const, text: result }] };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: formatErrorResponse(error) }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "place_limit_order",
    "⚠️ Place a LIMIT order on Trading 212. Executes when price reaches your limit. Positive quantity = BUY, negative = SELL. Requires TRADING212_ALLOW_TRADING=true.",
    PlaceLimitOrderInput.shape,
    async ({ ticker, quantity, limitPrice, timeValidity }) => {
      try {
        const result = await placeLimitOrder(
          client,
          allowTrading,
          ticker,
          quantity,
          limitPrice,
          timeValidity,
        );
        return { content: [{ type: "text" as const, text: result }] };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: formatErrorResponse(error) }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "place_stop_order",
    "⚠️ Place a STOP order on Trading 212. Triggers a market order when stop price is reached. Positive quantity = BUY, negative = SELL. Requires TRADING212_ALLOW_TRADING=true.",
    PlaceStopOrderInput.shape,
    async ({ ticker, quantity, stopPrice, timeValidity }) => {
      try {
        const result = await placeStopOrder(
          client,
          allowTrading,
          ticker,
          quantity,
          stopPrice,
          timeValidity,
        );
        return { content: [{ type: "text" as const, text: result }] };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: formatErrorResponse(error) }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "place_stop_limit_order",
    "⚠️ Place a STOP-LIMIT order on Trading 212. Triggers a limit order when stop price is reached. Positive quantity = BUY, negative = SELL. Requires TRADING212_ALLOW_TRADING=true.",
    PlaceStopLimitOrderInput.shape,
    async ({ ticker, quantity, stopPrice, limitPrice, timeValidity }) => {
      try {
        const result = await placeStopLimitOrder(
          client,
          allowTrading,
          ticker,
          quantity,
          stopPrice,
          limitPrice,
          timeValidity,
        );
        return { content: [{ type: "text" as const, text: result }] };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: formatErrorResponse(error) }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "cancel_order",
    "⚠️ Cancel a pending order by ID on Trading 212. Requires TRADING212_ALLOW_TRADING=true.",
    CancelOrderInput.shape,
    async ({ orderId }) => {
      try {
        const result = await cancelOrder(client, allowTrading, orderId);
        return { content: [{ type: "text" as const, text: result }] };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: formatErrorResponse(error) }],
          isError: true,
        };
      }
    },
  );

  // ─── Position Tools ─────────────────────────────────

  server.tool(
    "get_portfolio",
    "Get all open positions in your Trading 212 portfolio with current P&L, quantities, and prices",
    EmptyInput.shape,
    async () => {
      try {
        const result = await getPortfolio(client);
        return { content: [{ type: "text" as const, text: result }] };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: formatErrorResponse(error) }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "get_position",
    "Get details for a specific position in your Trading 212 portfolio by ticker symbol",
    GetPositionInput.shape,
    async ({ ticker }) => {
      try {
        const result = await getPosition(client, ticker);
        return { content: [{ type: "text" as const, text: result }] };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: formatErrorResponse(error) }],
          isError: true,
        };
      }
    },
  );

  // ─── History Tools ──────────────────────────────────

  server.tool(
    "get_order_history",
    "Get paginated historical orders from Trading 212. Use the nextCursor from the response to fetch the next page.",
    HistoryInput.shape,
    async ({ cursor, limit }) => {
      try {
        const result = await getOrderHistory(client, cursor, limit);
        return { content: [{ type: "text" as const, text: result }] };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: formatErrorResponse(error) }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "get_dividend_history",
    "Get paginated dividend payment history from Trading 212. Use the nextCursor from the response to fetch the next page.",
    HistoryInput.shape,
    async ({ cursor, limit }) => {
      try {
        const result = await getDividendHistory(client, cursor, limit);
        return { content: [{ type: "text" as const, text: result }] };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: formatErrorResponse(error) }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "get_transaction_history",
    "Get paginated transaction history (deposits, withdrawals) from Trading 212. Use the nextCursor from the response to fetch the next page.",
    HistoryInput.shape,
    async ({ cursor, limit }) => {
      try {
        const result = await getTransactionHistory(client, cursor, limit);
        return { content: [{ type: "text" as const, text: result }] };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: formatErrorResponse(error) }],
          isError: true,
        };
      }
    },
  );

  return server;
}
