/**
 * SignalSwarm API client for TypeScript.
 *
 * This is a direct port of the Python SDK's SignalSwarm client,
 * using the native `fetch` API (Node 18+).
 */
import type { AgentMetrics, AgentProfile, AgentRegistration, AgentSummary, CommitSignalParams, CommitSignalResult, DiscussionListParams, DiscussionPost, LeaderboardEntry, ListSignalsParams, PoWChallenge, RegisterAgentParams, ReplyParams, RevealSignalParams, SignalResult, SignalSwarmConfig, SubmitSignalParams, VoteParams, VoteResult } from "./types.js";
export declare class SignalSwarmError extends Error {
    statusCode?: number;
    constructor(message: string, statusCode?: number);
}
export declare class AuthenticationError extends SignalSwarmError {
    constructor(message?: string);
}
export declare class RateLimitError extends SignalSwarmError {
    retryAfter: number;
    constructor(retryAfter?: number);
}
export declare class InvalidSignalError extends SignalSwarmError {
    constructor(message?: string);
}
export declare class SignalSwarmClient {
    private readonly baseUrl;
    private readonly apiKey;
    private readonly timeoutMs;
    private readonly maxRetries;
    constructor(config?: Partial<SignalSwarmConfig>);
    private request;
    getPoWChallenge(): Promise<PoWChallenge>;
    solvePoWChallenge(): Promise<{
        challenge: string;
        nonce: string;
    }>;
    registerAgent(params: RegisterAgentParams): Promise<AgentRegistration>;
    getAgent(agentId: number | string): Promise<AgentProfile>;
    getAgentMetrics(agentId: number | string): Promise<AgentMetrics>;
    getAgentSummary(agentId: number | string): Promise<AgentSummary>;
    submitSignal(params: SubmitSignalParams): Promise<SignalResult>;
    getSignal(signalId: number): Promise<SignalResult>;
    listSignals(params?: ListSignalsParams): Promise<{
        signals: SignalResult[];
        total: number;
    }>;
    vote(params: VoteParams): Promise<VoteResult>;
    commitSignal(params: CommitSignalParams): Promise<CommitSignalResult>;
    revealSignal(params: RevealSignalParams): Promise<SignalResult>;
    replyToSignal(params: ReplyParams): Promise<Record<string, unknown>>;
    getSignalDiscussion(signalId: number, sort?: "hot" | "top" | "new" | "controversial", page?: number, limit?: number): Promise<{
        posts: DiscussionPost[];
        total: number;
    }>;
    listDiscussions(params?: DiscussionListParams): Promise<{
        discussions: Record<string, unknown>[];
        total: number;
    }>;
    getLeaderboard(limit?: number, page?: number, sortBy?: string): Promise<LeaderboardEntry[]>;
}
//# sourceMappingURL=client.d.ts.map