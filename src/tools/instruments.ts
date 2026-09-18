/**
 * Instrument tools — search instruments and list exchanges.
 */

import { Trading212Client } from "../api/client.js";

// ─── API Response Types ─────────────────────────────────

interface Instrument {
  ticker: string;
  name: string;
  type: string;
  currencyCode: string;
  isin: string;
  shortName: string;
  minTradeQuantity: number;
  maxOpenQuantity: number;
  addedOn: string;
  workingScheduleId?: number;
}

interface Exchange {
  id: number;
  name: string;
  workingSchedules: Array<{
    id: number;
    timeEvents: Array<{
      date: string;
      type: string;
    }>;
  }>;
}

// ─── Tool Handlers ──────────────────────────────────────

export async function searchInstruments(
  client: Trading212Client,
  query: string,
): Promise<string> {
  const instruments = await client.get<Instrument[]>(
    "/api/v0/equity/metadata/instruments",
  );

  const queryLower = query.toLowerCase();

  const matches = instruments.filter(
    (i) =>
      i.ticker.toLowerCase().includes(queryLower) ||
      i.name.toLowerCase().includes(queryLower) ||
      i.shortName.toLowerCase().includes(queryLower) ||
      i.isin.toLowerCase().includes(queryLower),
  );

  // Limit results to avoid overwhelming the AI context
  const limited = matches.slice(0, 25);

  return JSON.stringify(
    {
      query,
      totalMatches: matches.length,
      showing: limited.length,
      instruments: limited.map((i) => ({
        ticker: i.ticker,
        name: i.name,
        shortName: i.shortName,
        type: i.type,
        currency: i.currencyCode,
        isin: i.isin,
        minQuantity: i.minTradeQuantity,
        maxQuantity: i.maxOpenQuantity,
      })),
    },
    null,
    2,
  );
}

export async function getExchanges(client: Trading212Client): Promise<string> {
  const exchanges = await client.get<Exchange[]>(
    "/api/v0/equity/metadata/exchanges",
  );

  return JSON.stringify(
    {
      totalExchanges: exchanges.length,
      exchanges: exchanges.map((e) => ({
        id: e.id,
        name: e.name,
      })),
    },
    null,
    2,
  );
}
