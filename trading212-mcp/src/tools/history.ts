/**
 * History tools — paginated access to orders, dividends, and transactions.
 */

import { Trading212Client } from "../api/client.js";

// ─── API Response Types ─────────────────────────────────

interface PaginatedResponse<T> {
  items: T[];
  nextPagePath?: string;
}

interface HistoricalOrder {
  id: number;
  ticker: string;
  type: string;
  status: string;
  quantity: number;
  filledQuantity: number;
  fillPrice?: number;
  limitPrice?: number;
  stopPrice?: number;
  dateCreated: string;
  dateExecuted?: string;
  dateModified?: string;
}

interface Dividend {
  ticker: string;
  reference: string;
  quantity: number;
  amount: number;
  amountInEuro?: number;
  grossAmountPerShare: number;
  paidOn: string;
}

interface Transaction {
  reference: string;
  type: string;
  amount: number;
  dateTime: string;
}

// ─── Helpers ────────────────────────────────────────────

function buildHistoryUrl(
  basePath: string,
  cursor?: string,
  limit?: number,
): string {
  // If a cursor is provided, it's the full nextPagePath — use it directly
  if (cursor) {
    return cursor;
  }

  const params = new URLSearchParams();
  if (limit) {
    params.set("limit", limit.toString());
  }

  const queryStr = params.toString();
  return queryStr ? `${basePath}?${queryStr}` : basePath;
}

// ─── Tool Handlers ──────────────────────────────────────

export async function getOrderHistory(
  client: Trading212Client,
  cursor?: string,
  limit?: number,
): Promise<string> {
  const url = buildHistoryUrl(
    "/api/v0/equity/history/orders",
    cursor,
    limit,
  );

  const data = await client.get<PaginatedResponse<HistoricalOrder>>(url);

  return JSON.stringify(
    {
      environment: client.environment,
      totalItems: data.items.length,
      hasMore: !!data.nextPagePath,
      nextCursor: data.nextPagePath ?? null,
      orders: data.items.map((o) => ({
        id: o.id,
        ticker: o.ticker,
        type: o.type,
        status: o.status,
        quantity: o.quantity,
        filledQuantity: o.filledQuantity,
        fillPrice: o.fillPrice,
        limitPrice: o.limitPrice,
        stopPrice: o.stopPrice,
        created: o.dateCreated,
        executed: o.dateExecuted,
      })),
    },
    null,
    2,
  );
}

export async function getDividendHistory(
  client: Trading212Client,
  cursor?: string,
  limit?: number,
): Promise<string> {
  const url = buildHistoryUrl(
    "/api/v0/equity/history/dividends",
    cursor,
    limit,
  );

  const data = await client.get<PaginatedResponse<Dividend>>(url);

  return JSON.stringify(
    {
      environment: client.environment,
      totalItems: data.items.length,
      hasMore: !!data.nextPagePath,
      nextCursor: data.nextPagePath ?? null,
      dividends: data.items.map((d) => ({
        ticker: d.ticker,
        reference: d.reference,
        shares: d.quantity,
        amount: d.amount,
        grossPerShare: d.grossAmountPerShare,
        paidOn: d.paidOn,
      })),
    },
    null,
    2,
  );
}

export async function getTransactionHistory(
  client: Trading212Client,
  cursor?: string,
  limit?: number,
): Promise<string> {
  const url = buildHistoryUrl(
    "/api/v0/equity/history/transactions",
    cursor,
    limit,
  );

  const data = await client.get<PaginatedResponse<Transaction>>(url);

  return JSON.stringify(
    {
      environment: client.environment,
      totalItems: data.items.length,
      hasMore: !!data.nextPagePath,
      nextCursor: data.nextPagePath ?? null,
      transactions: data.items.map((t) => ({
        reference: t.reference,
        type: t.type,
        amount: t.amount,
        dateTime: t.dateTime,
      })),
    },
    null,
    2,
  );
}
