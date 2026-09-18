/**
 * Order tools — list, place, and cancel orders.
 *
 * ⚠️ Order placement tools are gated behind the TRADING212_ALLOW_TRADING flag.
 * They interact with real money on the live environment.
 */

import { Trading212Client } from "../api/client.js";
import { TradingDisabledError } from "../utils/errors.js";

// ─── API Response Types ─────────────────────────────────

interface PendingOrder {
  orderId: number;
  ticker: string;
  type: string;
  status: string;
  quantity: number;
  filledQuantity: number;
  limitPrice?: number;
  stopPrice?: number;
  creationTime: string;
  timeValidity: string;
}

interface PlacedOrder {
  orderId: number;
  ticker: string;
  type: string;
  status: string;
  quantity: number;
  filledQuantity: number;
  limitPrice?: number;
  stopPrice?: number;
}

// ─── Guard ──────────────────────────────────────────────

function assertTradingEnabled(
  allowTrading: boolean,
  toolName: string,
): void {
  if (!allowTrading) {
    throw new TradingDisabledError(toolName);
  }
}

// ─── Tool Handlers ──────────────────────────────────────

export async function listPendingOrders(
  client: Trading212Client,
): Promise<string> {
  const orders = await client.get<PendingOrder[]>("/api/v0/equity/orders");

  return JSON.stringify(
    {
      environment: client.environment,
      totalPending: orders.length,
      orders: orders.map((o) => ({
        orderId: o.orderId,
        ticker: o.ticker,
        type: o.type,
        status: o.status,
        quantity: o.quantity,
        filledQuantity: o.filledQuantity,
        limitPrice: o.limitPrice,
        stopPrice: o.stopPrice,
        timeValidity: o.timeValidity,
        created: o.creationTime,
      })),
    },
    null,
    2,
  );
}

export async function placeMarketOrder(
  client: Trading212Client,
  allowTrading: boolean,
  ticker: string,
  quantity: number,
): Promise<string> {
  assertTradingEnabled(allowTrading, "place_market_order");

  const order = await client.post<PlacedOrder>(
    "/api/v0/equity/orders/market",
    { ticker, quantity },
  );

  return JSON.stringify(
    {
      environment: client.environment,
      action: quantity > 0 ? "BUY" : "SELL",
      order: {
        orderId: order.orderId,
        ticker: order.ticker,
        type: order.type,
        status: order.status,
        quantity: order.quantity,
        filledQuantity: order.filledQuantity,
      },
    },
    null,
    2,
  );
}

export async function placeLimitOrder(
  client: Trading212Client,
  allowTrading: boolean,
  ticker: string,
  quantity: number,
  limitPrice: number,
  timeValidity: string,
): Promise<string> {
  assertTradingEnabled(allowTrading, "place_limit_order");

  const order = await client.post<PlacedOrder>(
    "/api/v0/equity/orders/limit",
    { ticker, quantity, limitPrice, timeValidity },
  );

  return JSON.stringify(
    {
      environment: client.environment,
      action: quantity > 0 ? "BUY" : "SELL",
      order: {
        orderId: order.orderId,
        ticker: order.ticker,
        type: order.type,
        status: order.status,
        quantity: order.quantity,
        limitPrice: order.limitPrice,
      },
    },
    null,
    2,
  );
}

export async function placeStopOrder(
  client: Trading212Client,
  allowTrading: boolean,
  ticker: string,
  quantity: number,
  stopPrice: number,
  timeValidity: string,
): Promise<string> {
  assertTradingEnabled(allowTrading, "place_stop_order");

  const order = await client.post<PlacedOrder>(
    "/api/v0/equity/orders/stop",
    { ticker, quantity, stopPrice, timeValidity },
  );

  return JSON.stringify(
    {
      environment: client.environment,
      action: quantity > 0 ? "BUY" : "SELL",
      order: {
        orderId: order.orderId,
        ticker: order.ticker,
        type: order.type,
        status: order.status,
        quantity: order.quantity,
        stopPrice: order.stopPrice,
      },
    },
    null,
    2,
  );
}

export async function placeStopLimitOrder(
  client: Trading212Client,
  allowTrading: boolean,
  ticker: string,
  quantity: number,
  stopPrice: number,
  limitPrice: number,
  timeValidity: string,
): Promise<string> {
  assertTradingEnabled(allowTrading, "place_stop_limit_order");

  const order = await client.post<PlacedOrder>(
    "/api/v0/equity/orders/stop_limit",
    { ticker, quantity, stopPrice, limitPrice, timeValidity },
  );

  return JSON.stringify(
    {
      environment: client.environment,
      action: quantity > 0 ? "BUY" : "SELL",
      order: {
        orderId: order.orderId,
        ticker: order.ticker,
        type: order.type,
        status: order.status,
        quantity: order.quantity,
        stopPrice: order.stopPrice,
        limitPrice: order.limitPrice,
      },
    },
    null,
    2,
  );
}

export async function cancelOrder(
  client: Trading212Client,
  allowTrading: boolean,
  orderId: string,
): Promise<string> {
  assertTradingEnabled(allowTrading, "cancel_order");

  await client.delete(`/api/v0/equity/orders/${orderId}`);

  return JSON.stringify(
    {
      environment: client.environment,
      cancelled: true,
      orderId,
    },
    null,
    2,
  );
}
