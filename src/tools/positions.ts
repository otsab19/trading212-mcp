/**
 * Position tools — view portfolio and individual positions.
 */

import { Trading212Client } from "../api/client.js";

// ─── API Response Types ─────────────────────────────────

interface Position {
  ticker: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  ppl: number;
  fxPpl?: number;
  initialFillDate: string;
  frontend?: string;
  maxBuy?: number;
  maxSell?: number;
  pieQuantity?: number;
}

// ─── Tool Handlers ──────────────────────────────────────

export async function getPortfolio(client: Trading212Client): Promise<string> {
  const positions = await client.get<Position[]>("/api/v0/equity/portfolio");

  const totalInvested = positions.reduce(
    (sum, p) => sum + p.averagePrice * p.quantity,
    0,
  );
  const totalPnL = positions.reduce((sum, p) => sum + p.ppl, 0);

  return JSON.stringify(
    {
      environment: client.environment,
      totalPositions: positions.length,
      summary: {
        totalInvested: Math.round(totalInvested * 100) / 100,
        totalProfitLoss: Math.round(totalPnL * 100) / 100,
        totalPnLPercent:
          totalInvested > 0
            ? Math.round((totalPnL / totalInvested) * 10000) / 100
            : 0,
      },
      positions: positions.map((p) => ({
        ticker: p.ticker,
        quantity: p.quantity,
        averagePrice: p.averagePrice,
        currentPrice: p.currentPrice,
        profitLoss: p.ppl,
        pnlPercent:
          p.averagePrice > 0
            ? Math.round(
                ((p.currentPrice - p.averagePrice) / p.averagePrice) * 10000,
              ) / 100
            : 0,
        invested: Math.round(p.averagePrice * p.quantity * 100) / 100,
        currentValue: Math.round(p.currentPrice * p.quantity * 100) / 100,
        openedAt: p.initialFillDate,
      })),
    },
    null,
    2,
  );
}

export async function getPosition(
  client: Trading212Client,
  ticker: string,
): Promise<string> {
  const position = await client.get<Position>(
    `/api/v0/equity/portfolio/${ticker}`,
  );

  return JSON.stringify(
    {
      environment: client.environment,
      position: {
        ticker: position.ticker,
        quantity: position.quantity,
        averagePrice: position.averagePrice,
        currentPrice: position.currentPrice,
        profitLoss: position.ppl,
        fxProfitLoss: position.fxPpl,
        pnlPercent:
          position.averagePrice > 0
            ? Math.round(
                ((position.currentPrice - position.averagePrice) /
                  position.averagePrice) *
                  10000,
              ) / 100
            : 0,
        invested:
          Math.round(position.averagePrice * position.quantity * 100) / 100,
        currentValue:
          Math.round(position.currentPrice * position.quantity * 100) / 100,
        openedAt: position.initialFillDate,
      },
    },
    null,
    2,
  );
}
