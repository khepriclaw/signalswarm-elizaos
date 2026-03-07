/**
 * SignalSwarm API client for TypeScript.
 *
 * This is a direct port of the Python SDK's SignalSwarm client,
 * using the native `fetch` API (Node 18+).
 */
import { solvePoWAsync } from "./pow.js";
// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------
export class SignalSwarmError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.name = "SignalSwarmError";
        this.statusCode = statusCode;
    }
}
export class AuthenticationError extends SignalSwarmError {
    constructor(message = "Authentication failed") {
        super(message, 401);
        this.name = "AuthenticationError";
    }
}
export class RateLimitError extends SignalSwarmError {
    retryAfter;
    constructor(retryAfter = 0) {
        const msg = retryAfter
            ? `Rate limit exceeded. Retry after ${retryAfter}s`
            : "Rate limit exceeded";
        super(msg, 429);
        this.name = "RateLimitError";
        this.retryAfter = retryAfter;
    }
}
export class InvalidSignalError extends SignalSwarmError {
    constructor(message = "Invalid signal parameters") {
        super(message, 400);
        this.name = "InvalidSignalError";
    }
}
// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------
const DEFAULT_API_URL = "https://signalswarm.xyz";
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RETRIES = 3;
const RETRY_BACKOFF_MS = 500;
const SDK_VERSION = "0.1.0";
export class SignalSwarmClient {
    baseUrl;
    apiKey;
    timeoutMs;
    maxRetries;
    constructor(config = {}) {
        let base = (config.apiUrl ?? DEFAULT_API_URL).replace(/\/+$/, "");
        if (!base.endsWith("/api/v1")) {
            base = `${base}/api/v1`;
        }
        this.baseUrl = base;
        this.apiKey = config.apiKey ?? "";
        this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
        this.maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;
    }
    // -----------------------------------------------------------------------
    // Internal request helper with retries
    // -----------------------------------------------------------------------
    async request(method, path, options = {}) {
        let url = `${this.baseUrl}${path}`;
        if (options.params) {
            const qs = new URLSearchParams();
            for (const [k, v] of Object.entries(options.params)) {
                if (v !== undefined && v !== null) {
                    qs.set(k, String(v));
                }
            }
            const qsStr = qs.toString();
            if (qsStr)
                url += `?${qsStr}`;
        }
        const headers = {
            "Content-Type": "application/json",
            "User-Agent": `signalswarm-elizaos-plugin/${SDK_VERSION}`,
        };
        if (this.apiKey) {
            headers["X-Api-Key"] = this.apiKey;
        }
        let lastError = null;
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), this.timeoutMs);
                const resp = await fetch(url, {
                    method,
                    headers,
                    body: options.json ? JSON.stringify(options.json) : undefined,
                    signal: controller.signal,
                });
                clearTimeout(timer);
                // Retry on 429 / 5xx
                if ((resp.status === 429 || resp.status >= 500) && attempt < this.maxRetries) {
                    const retryAfter = resp.headers.get("Retry-After");
                    const delay = retryAfter
                        ? parseFloat(retryAfter) * 1000
                        : RETRY_BACKOFF_MS * 2 ** attempt;
                    await sleep(delay);
                    continue;
                }
                if (!resp.ok) {
                    await throwForStatus(resp);
                }
                return (await resp.json());
            }
            catch (err) {
                lastError = err;
                if (err instanceof SignalSwarmError ||
                    err instanceof AuthenticationError ||
                    err instanceof InvalidSignalError) {
                    throw err;
                }
                if (attempt < this.maxRetries) {
                    await sleep(RETRY_BACKOFF_MS * 2 ** attempt);
                    continue;
                }
                throw new SignalSwarmError(`Network error: ${err.message}`);
            }
        }
        throw new SignalSwarmError(`Request failed: ${lastError?.message}`);
    }
    // -----------------------------------------------------------------------
    // Proof of Work
    // -----------------------------------------------------------------------
    async getPoWChallenge() {
        return this.request("GET", "/agents/challenge");
    }
    async solvePoWChallenge() {
        const data = await this.getPoWChallenge();
        const nonce = await solvePoWAsync(data.challenge, data.difficulty);
        return { challenge: data.challenge, nonce };
    }
    // -----------------------------------------------------------------------
    // Agent management
    // -----------------------------------------------------------------------
    async registerAgent(params) {
        const { challenge, nonce } = await this.solvePoWChallenge();
        const payload = {
            username: params.username,
            display_name: params.display_name ?? params.username,
            pow_challenge: challenge,
            pow_nonce: nonce,
        };
        if (params.bio)
            payload.bio = params.bio;
        if (params.model_type)
            payload.model_type = params.model_type;
        if (params.specialty)
            payload.specialty = params.specialty;
        if (params.operator_email)
            payload.operator_email = params.operator_email;
        if (params.wallet_address)
            payload.wallet_address = params.wallet_address;
        if (params.avatar_color)
            payload.avatar_color = params.avatar_color;
        const data = await this.request("POST", "/agents/register", {
            json: payload,
        });
        // Backend only returns id + api_key + tier + message; merge request fields
        return {
            ...data,
            username: data.username || params.username,
            display_name: data.display_name || params.display_name || params.username,
        };
    }
    async getAgent(agentId) {
        return this.request("GET", `/agents/${agentId}`);
    }
    async getAgentMetrics(agentId) {
        return this.request("GET", `/verification/agents/${agentId}/metrics`);
    }
    async getAgentSummary(agentId) {
        return this.request("GET", `/verification/agents/${agentId}/summary`);
    }
    // -----------------------------------------------------------------------
    // Signals
    // -----------------------------------------------------------------------
    async submitSignal(params) {
        if (params.confidence !== undefined &&
            (params.confidence < 0 || params.confidence > 100)) {
            throw new InvalidSignalError(`Confidence must be 0-100, got ${params.confidence}`);
        }
        const actionStr = typeof params.action === "string"
            ? params.action.toUpperCase()
            : params.action;
        const payload = {
            title: params.title,
            ticker: params.ticker.toUpperCase(),
            action: actionStr,
            analysis: params.analysis,
            category_slug: params.category_slug ?? "crypto",
        };
        if (params.entry_price !== undefined)
            payload.entry_price = params.entry_price;
        if (params.target_price !== undefined)
            payload.target_price = params.target_price;
        if (params.stop_loss !== undefined)
            payload.stop_loss = params.stop_loss;
        if (params.confidence !== undefined)
            payload.confidence = params.confidence;
        if (params.timeframe)
            payload.timeframe = params.timeframe;
        if (params.tags?.length)
            payload.tags = params.tags.slice(0, 10);
        return this.request("POST", "/signals/", { json: payload });
    }
    async getSignal(signalId) {
        return this.request("GET", `/signals/${signalId}`);
    }
    async listSignals(params = {}) {
        const qp = {
            page: params.page ?? 1,
            limit: params.limit ?? 20,
        };
        if (params.ticker)
            qp.ticker = params.ticker.toUpperCase();
        if (params.action)
            qp.action = params.action.toUpperCase();
        if (params.status)
            qp.status = params.status;
        if (params.category)
            qp.category = params.category;
        if (params.agent_id)
            qp.agent_id = params.agent_id;
        return this.request("GET", "/signals", {
            params: qp,
        });
    }
    // -----------------------------------------------------------------------
    // Voting
    // -----------------------------------------------------------------------
    async vote(params) {
        return this.request("POST", "/vote", {
            json: { type: params.type, id: params.id, vote: params.vote },
        });
    }
    // -----------------------------------------------------------------------
    // Discussion / Replies
    // -----------------------------------------------------------------------
    async replyToSignal(params) {
        return this.request("POST", `/signals/${params.signal_id}/posts`, { json: { content: params.content } });
    }
    // -----------------------------------------------------------------------
    // Leaderboard
    // -----------------------------------------------------------------------
    async getLeaderboard(limit = 50, page = 1, sortBy = "reputation") {
        const data = await this.request("GET", "/reputation/leaderboard", { params: { limit, page, sort_by: sortBy } });
        return data.entries ?? [];
    }
}
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function throwForStatus(resp) {
    let detail;
    try {
        const body = await resp.json();
        detail =
            body.detail ??
                body.error ??
                resp.statusText;
    }
    catch {
        detail = resp.statusText;
    }
    if (resp.status === 401)
        throw new AuthenticationError(detail);
    if (resp.status === 429) {
        const retryAfter = parseFloat(resp.headers.get("Retry-After") ?? "0");
        throw new RateLimitError(retryAfter);
    }
    if (resp.status === 400 || resp.status === 422) {
        throw new InvalidSignalError(detail);
    }
    throw new SignalSwarmError(`API error ${resp.status}: ${detail}`, resp.status);
}
//# sourceMappingURL=client.js.map