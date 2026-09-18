/**
 * Account tools — get account info, cash balances, and summary.
 */

import { Trading212Client } from "../api/client.js";

// ─── API Response Types ─────────────────────────────────

interface AccountInfo {
  id: number;
  currencyCode: string;
}

interface AccountCash {
  free: number;
  total: number;
  ppl: number;
  result: number;
  invested: number;
  pipiValue: number;
  blocked: number;
}

// ─── Tool Handlers ──────────────────────────────────────

export async function getAccountInfo(client: Trading212Client): Promise<string> {
  const data = await client.get<AccountInfo>("/api/v0/equity/account/info");
  return JSON.stringify(
    {
      environment: client.environment,
      accountId: data.id,
      currency: data.currencyCode,
    },
    null,
    2,
  );
}

export async function getAccountCash(client: Trading212Client): Promise<string> {
  const data = await client.get<AccountCash>("/api/v0/equity/account/cash");
  return JSON.stringify(
    {
      environment: client.environment,
      freeCash: data.free,
      totalCash: data.total,
      profitLoss: data.ppl,
      result: data.result,
      invested: data.invested,
      blocked: data.blocked,
    },
    null,
    2,
  );
}

export async function getAccountSummary(client: Trading212Client): Promise<string> {
  // The summary endpoint returns a comprehensive view
  // We'll call both info and cash to compose a full summary
  const [info, cash] = await Promise.all([
    client.get<AccountInfo>("/api/v0/equity/account/info"),
    client.get<AccountCash>("/api/v0/equity/account/cash"),
  ]);

  return JSON.stringify(
    {
      environment: client.environment,
      account: {
        id: info.id,
        currency: info.currencyCode,
      },
      balances: {
        freeCash: cash.free,
        totalValue: cash.total,
        invested: cash.invested,
        profitLoss: cash.ppl,
        result: cash.result,
        blocked: cash.blocked,
      },
    },
    null,
    2,
  );
}
