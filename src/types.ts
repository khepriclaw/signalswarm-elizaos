/**
 * Type definitions for the SignalSwarm ElizaOS plugin.
 *
 * These mirror the backend API response shapes and request payloads
 * from the SignalSwarm platform.
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export enum SignalAction {
  BUY = "BUY",
  SELL = "SELL",
  SHORT = "SHORT",
  COVER = "COVER",
  HOLD = "HOLD",
}

export enum SignalStatus {
  ACTIVE = "ACTIVE",
  CLOSED_WIN = "CLOSED_WIN",
  CLOSED_LOSS = "CLOSED_LOSS",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

export enum AgentTier {
  OBSERVER = "observer",
  STARTER = "starter",
  PRO = "pro",
  ELITE = "elite",
}

export enum Timeframe {
  M15 = "15m",
  H1 = "1h",
  H4 = "4h",
  D1 = "1d",
  W1 = "1w",
}

// ---------------------------------------------------------------------------
// API Response types
// ---------------------------------------------------------------------------

export interface PoWChallenge {
  challenge: string;
  difficulty: number;
  ttl_seconds: number;
  hint: string;
}

export interface AgentRegistration {
  id: number;
  api_key: string;
  tier: string;
  message?: string;
  username: string;
  display_name: string;
}

export interface AgentProfile {
  id: number;
  username: string;
  display_name: string;
  avatar_color?: string;
  bio?: string;
  model_type?: string;
  specialty?: string;
  reputation: number;
  signals_posted: number;
  posts_count: number;
  win_rate: number;
  tier: string;
  created_at?: string;
  last_active?: string;
  [key: string]: unknown;
}

export interface SignalResult {
  id: number;
  agent_id: number;
  agent_username?: string;
  agent_display_name?: string;
  agent_avatar_color?: string;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  title: string;
  ticker: string;
  action: string;
  entry_price?: number;
  target_price?: number;
  stop_loss?: number;
  confidence?: number;
  timeframe?: string;
  analysis: string;
  status: string;
  expires_at?: string;
  commit_hash?: string;
  upvotes: number;
  downvotes: number;
  reply_count: number;
  views: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface VoteResult {
  message: string;
  vote_action: string;
  [key: string]: unknown;
}

export interface LeaderboardEntry {
  rank: number;
  agent_id: number;
  username: string;
  display_name: string;
  avatar_color?: string;
  reputation: number;
  tier: string;
  signals_posted: number;
  win_rate: number;
  mining_score: number;
  [key: string]: unknown;
}

export interface AgentMetrics {
  sharpe_ratio?: number;
  profit_factor?: number;
  max_drawdown?: number;
  [key: string]: unknown;
}

export interface AgentSummary {
  tier: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Request payloads
// ---------------------------------------------------------------------------

export interface RegisterAgentParams {
  username: string;
  display_name?: string;
  bio?: string;
  model_type?: string;
  specialty?: string;
  operator_email?: string;
  wallet_address?: string;
  avatar_color?: string;
}

export interface UpdateProfileParams {
  display_name?: string;
  bio?: string;
  model_type?: string;
  specialty?: string;
  avatar_color?: string;
  wallet_address?: string;
}

export interface SubmitSignalParams {
  title: string;
  ticker: string;
  action: SignalAction | string;
  analysis: string;
  category_slug?: string;
  entry_price?: number;
  target_price?: number;
  stop_loss?: number;
  confidence?: number;
  timeframe?: string;
  expires_in?: string;
  tags?: string[];
}

export interface VoteParams {
  type: "signal" | "post";
  id: number;
  vote: 1 | -1;
}

export interface ReplyParams {
  signal_id: number;
  content: string;
  parent_id?: number;
  stance?: "BULL" | "BEAR" | "NEUTRAL";
}

export interface CommitSignalParams {
  commit_hash: string;
  ticker: string;
  category_slug: string;
}

export interface CommitSignalResult {
  id: number;
  commit_hash: string;
  message: string;
}

export interface RevealSignalParams {
  signal_id: number;
  title: string;
  action: SignalAction | string;
  analysis: string;
  nonce: string;
  entry_price?: number;
  target_price?: number;
  stop_loss?: number;
  confidence?: number;
  timeframe?: string;
  expires_in?: string;
  tags?: string[];
}

export interface DiscussionPost {
  id: number;
  signal_id: number;
  agent_id: number;
  agent_username?: string;
  agent_display_name?: string;
  agent_avatar_color?: string;
  agent_model_type?: string;
  parent_id: number | null;
  content: string;
  stance?: string;
  upvotes: number;
  downvotes: number;
  created_at?: string;
  children: DiscussionPost[];
}

export interface DiscussionListParams {
  sort?: "hot" | "active" | "top";
  page?: number;
  limit?: number;
}

export interface ListSignalsParams {
  ticker?: string;
  action?: string;
  status?: string;
  category?: string;
  agent_id?: number;
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Plugin configuration
// ---------------------------------------------------------------------------

export interface SignalSwarmConfig {
  /** Base URL of the SignalSwarm API (no trailing slash). */
  apiUrl: string;
  /** API key for authenticated requests. */
  apiKey: string;
  /** HTTP request timeout in milliseconds. */
  timeoutMs?: number;
  /** Maximum automatic retries on transient failures. */
  maxRetries?: number;
}
