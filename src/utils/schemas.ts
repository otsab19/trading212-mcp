/**
 * Zod schemas for all MCP tool inputs.
 * Following Matt Pocock's pattern: every tool gets a well-typed Zod schema.
 */

import { z } from "zod";

// ─── Account ──────────────────────────────────────────────

export const EmptyInput = z.object({});

// ─── Instruments ──────────────────────────────────────────

export const SearchInstrumentsInput = z.object({
  query: z
    .string()
    .describe(
      "Search query — can be a ticker symbol (e.g. AAPL), company name (e.g. Apple), or ISIN",
    ),
});

// ─── Orders ───────────────────────────────────────────────

const TimeValidity = z
  .enum(["DAY", "GTC"])
  .optional()
  .default("DAY")
  .describe('Order time validity: "DAY" (expires end of day) or "GTC" (good till cancelled)');

export const PlaceMarketOrderInput = z.object({
  ticker: z.string().describe("Instrument ticker symbol (e.g. AAPL_US_EQ)"),
  quantity: z
    .number()
    .describe("Number of shares. Positive = BUY, negative = SELL"),
});

export const PlaceLimitOrderInput = z.object({
  ticker: z.string().describe("Instrument ticker symbol (e.g. AAPL_US_EQ)"),
  quantity: z
    .number()
    .describe("Number of shares. Positive = BUY, negative = SELL"),
  limitPrice: z.number().positive().describe("Limit price for the order"),
  timeValidity: TimeValidity,
});

export const PlaceStopOrderInput = z.object({
  ticker: z.string().describe("Instrument ticker symbol (e.g. AAPL_US_EQ)"),
  quantity: z
    .number()
    .describe("Number of shares. Positive = BUY, negative = SELL"),
  stopPrice: z.number().positive().describe("Stop (trigger) price for the order"),
  timeValidity: TimeValidity,
});

export const PlaceStopLimitOrderInput = z.object({
  ticker: z.string().describe("Instrument ticker symbol (e.g. AAPL_US_EQ)"),
  quantity: z
    .number()
    .describe("Number of shares. Positive = BUY, negative = SELL"),
  stopPrice: z.number().positive().describe("Stop (trigger) price"),
  limitPrice: z.number().positive().describe("Limit price (execution price after stop triggers)"),
  timeValidity: TimeValidity,
});

export const CancelOrderInput = z.object({
  orderId: z.string().describe("The ID of the pending order to cancel"),
});

// ─── Positions ────────────────────────────────────────────

export const GetPositionInput = z.object({
  ticker: z.string().describe("Instrument ticker symbol (e.g. AAPL_US_EQ)"),
});

// ─── History ──────────────────────────────────────────────

export const HistoryInput = z.object({
  cursor: z
    .string()
    .optional()
    .describe("Pagination cursor from previous response's nextPagePath"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .default(20)
    .describe("Number of items per page (1-50, default 20)"),
});
