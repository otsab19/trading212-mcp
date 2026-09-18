/**
 * Trading 212 API Client
 *
 * Typed HTTP client for the Trading 212 Public API (v0).
 * Handles authentication, rate limiting, and error wrapping.
 */

import {
  Trading212Error,
  RateLimitError,
  AuthenticationError,
} from "../utils/errors.js";

// ─── Types ────────────────────────────────────────────────

export interface Trading212Config {
  apiKey: string;
  environment: "demo" | "live";
}

interface RateLimitInfo {
  used: number;
  reset: Date;
}

// ─── Client ───────────────────────────────────────────────

export class Trading212Client {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private rateLimitInfo: RateLimitInfo | null = null;

  constructor(config: Trading212Config) {
    this.apiKey = config.apiKey;
    this.baseUrl =
      config.environment === "live"
        ? "https://live.trading212.com"
        : "https://demo.trading212.com";
  }

  /** Current rate limit state (if known). */
  get rateLimit(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  /** Which environment we're connected to. */
  get environment(): string {
    return this.baseUrl.includes("live") ? "live" : "demo";
  }

  // ─── HTTP Methods ─────────────────────────────────────

  async get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }

  // ─── Core Request ─────────────────────────────────────

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const headers: Record<string, string> = {
      Authorization: this.apiKey,
      "Content-Type": "application/json",
    };

    const init: RequestInit = {
      method,
      headers,
    };

    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (error) {
      throw new Trading212Error(
        `Network error calling ${method} ${path}: ${error instanceof Error ? error.message : "Unknown error"}`,
        undefined,
        path,
        error,
      );
    }

    // Track rate limits from headers
    this.updateRateLimitInfo(response);

    // Handle error responses
    if (!response.ok) {
      await this.handleErrorResponse(response, path);
    }

    // Handle 204 No Content (e.g., successful DELETE)
    if (response.status === 204) {
      return {} as T;
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new Trading212Error(
        `Failed to parse JSON response from ${method} ${path}`,
        response.status,
        path,
      );
    }
  }

  // ─── Rate Limit Tracking ──────────────────────────────

  private updateRateLimitInfo(response: Response): void {
    const used = response.headers.get("x-ratelimit-used");
    const reset = response.headers.get("x-ratelimit-reset");

    if (used !== null || reset !== null) {
      this.rateLimitInfo = {
        used: used ? parseInt(used, 10) : 0,
        reset: reset ? new Date(parseInt(reset, 10) * 1000) : new Date(),
      };
    }
  }

  // ─── Error Handling ───────────────────────────────────

  private async handleErrorResponse(
    response: Response,
    path: string,
  ): Promise<never> {
    if (response.status === 401) {
      throw new AuthenticationError(path);
    }

    if (response.status === 429) {
      const resetHeader = response.headers.get("x-ratelimit-reset");
      const resetAt = resetHeader
        ? new Date(parseInt(resetHeader, 10) * 1000)
        : new Date(Date.now() + 60_000);
      throw new RateLimitError(resetAt, path);
    }

    let errorBody: string;
    try {
      errorBody = await response.text();
    } catch {
      errorBody = "Unable to read error response body";
    }

    throw new Trading212Error(
      `API returned ${response.status}: ${errorBody}`,
      response.status,
      path,
      errorBody,
    );
  }
}
