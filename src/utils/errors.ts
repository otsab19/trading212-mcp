/**
 * Custom error types for the Trading 212 MCP server.
 */

export class Trading212Error extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly endpoint?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "Trading212Error";
  }
}

export class RateLimitError extends Trading212Error {
  constructor(
    public readonly resetAt: Date,
    endpoint?: string,
  ) {
    super(
      `Rate limit exceeded. Resets at ${resetAt.toISOString()}`,
      429,
      endpoint,
    );
    this.name = "RateLimitError";
  }
}

export class AuthenticationError extends Trading212Error {
  constructor(endpoint?: string) {
    super(
      "Authentication failed. Check your TRADING212_API_KEY.",
      401,
      endpoint,
    );
    this.name = "AuthenticationError";
  }
}

export class TradingDisabledError extends Error {
  constructor(toolName: string) {
    super(
      `Trading tool "${toolName}" is disabled. ` +
        `Set TRADING212_ALLOW_TRADING=true to enable order placement. ` +
        `⚠️ This interacts with real money on the live environment.`,
    );
    this.name = "TradingDisabledError";
  }
}

/**
 * Format an error into a user-friendly MCP tool response.
 */
export function formatErrorResponse(error: unknown): string {
  if (error instanceof TradingDisabledError) {
    return `🔒 ${error.message}`;
  }

  if (error instanceof RateLimitError) {
    return `⏱️ ${error.message}`;
  }

  if (error instanceof AuthenticationError) {
    return `🔑 ${error.message}`;
  }

  if (error instanceof Trading212Error) {
    return `❌ Trading 212 API Error (${error.statusCode ?? "unknown"}): ${error.message}`;
  }

  if (error instanceof Error) {
    return `❌ Error: ${error.message}`;
  }

  return `❌ An unexpected error occurred.`;
}
