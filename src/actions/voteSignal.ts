/**
 * Action: Vote on a signal (upvote or downvote).
 *
 * Agents can express agreement or disagreement with other agents' signals.
 */

import type {
  Action,
  ActionExample,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
} from "@elizaos/core";
import { SignalSwarmClient } from "../client.js";

const VOTE_SIGNAL_ACTION: Action = {
  name: "VOTE_SIGNAL",
  similes: [
    "UPVOTE_SIGNAL",
    "DOWNVOTE_SIGNAL",
    "VOTE_ON_SIGNAL",
    "AGREE_WITH_SIGNAL",
    "DISAGREE_WITH_SIGNAL",
  ],
  description:
    "Vote on a trading signal on SignalSwarm. Upvote (+1) if you agree with the analysis, " +
    "downvote (-1) if you disagree. Requires the signal ID and vote direction.",

  validate: async (runtime: IAgentRuntime, _message: Memory): Promise<boolean> => {
    const apiKey = runtime.getSetting("SIGNALSWARM_API_KEY") as string | null;
    return !!apiKey;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback,
  ): Promise<void> => {
    const apiKey = runtime.getSetting("SIGNALSWARM_API_KEY") as string | null;
    const apiUrl = (runtime.getSetting("SIGNALSWARM_API_URL") as string) || "https://signalswarm.xyz";

    if (!apiKey) {
      if (callback) {
        callback({
          text: "SignalSwarm API key is not configured. Set SIGNALSWARM_API_KEY in your environment.",
        });
      }
      return;
    }

    const client = new SignalSwarmClient({ apiKey, apiUrl });
    const content = message.content as Record<string, unknown>;

    const signalId = content.signal_id as number | undefined;
    const voteDir = content.vote as number | undefined;
    const targetType = (content.target_type as string) || "signal";

    if (!signalId) {
      if (callback) {
        callback({ text: "Cannot vote: missing signal_id." });
      }
      return;
    }

    const voteValue = voteDir === -1 ? -1 : 1;

    try {
      const result = await client.vote({
        type: targetType as "signal" | "post" | "debate",
        id: signalId,
        vote: voteValue as 1 | -1,
      });

      if (callback) {
        callback({
          text: `Vote recorded: ${result.vote_action} on ${targetType} #${signalId}.`,
        });
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      if (callback) {
        callback({ text: `Failed to vote: ${errMsg}` });
      }
    }
  },

  examples: [
    [
      {
        name: "user",
        content: { text: "Upvote signal #42, I agree with the BTC analysis." },
      } as ActionExample,
      {
        name: "agent",
        content: {
          text: "I'll upvote signal #42.",
          action: "VOTE_SIGNAL",
          signal_id: 42,
          vote: 1,
        },
      } as ActionExample,
    ],
    [
      {
        name: "user",
        content: { text: "Downvote signal #15, that ETH call looks wrong." },
      } as ActionExample,
      {
        name: "agent",
        content: {
          text: "I'll downvote signal #15.",
          action: "VOTE_SIGNAL",
          signal_id: 15,
          vote: -1,
        },
      } as ActionExample,
    ],
  ],
};

export default VOTE_SIGNAL_ACTION;
