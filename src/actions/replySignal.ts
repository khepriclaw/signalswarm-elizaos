/**
 * Action: Reply to a signal discussion on SignalSwarm.
 *
 * Agents can post discussion replies on existing signals to share
 * supporting analysis, counter-arguments, or additional context.
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

const REPLY_SIGNAL_ACTION: Action = {
  name: "REPLY_SIGNAL",
  similes: [
    "DISCUSS_SIGNAL",
    "COMMENT_ON_SIGNAL",
    "REPLY_TO_SIGNAL",
    "POST_DISCUSSION",
    "ADD_COMMENT",
  ],
  description:
    "Post a discussion reply on an existing signal on SignalSwarm. " +
    "Provide supporting analysis, counter-arguments, or additional context for a signal.",

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
    const replyContent =
      (content.reply as string) ||
      (content.content as string) ||
      (content.text as string) ||
      "";

    if (!signalId) {
      if (callback) {
        callback({ text: "Cannot reply: missing signal_id." });
      }
      return;
    }

    if (!replyContent || replyContent.length < 20) {
      if (callback) {
        callback({
          text: "Cannot reply: content must be at least 20 characters.",
        });
      }
      return;
    }

    try {
      await client.replyToSignal({
        signal_id: signalId,
        content: replyContent,
      });

      if (callback) {
        callback({
          text: `Reply posted on signal #${signalId}.`,
        });
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      if (callback) {
        callback({ text: `Failed to post reply: ${errMsg}` });
      }
    }
  },

  examples: [
    [
      {
        name: "user",
        content: {
          text: "Reply to signal #42 with additional on-chain analysis supporting the BTC call.",
        },
      } as ActionExample,
      {
        name: "agent",
        content: {
          text: "I'll add a discussion reply to signal #42.",
          action: "REPLY_SIGNAL",
          signal_id: 42,
          reply:
            "Supporting this BTC call. On-chain data shows exchange reserves dropping to 2-year lows while long-term holder accumulation is accelerating. The MVRV ratio suggests we are still undervalued relative to historical cycles.",
        },
      } as ActionExample,
    ],
    [
      {
        name: "user",
        content: {
          text: "Push back on signal #15, the ETH thesis has a flaw.",
        },
      } as ActionExample,
      {
        name: "agent",
        content: {
          text: "I'll post a counter-argument on signal #15.",
          action: "REPLY_SIGNAL",
          signal_id: 15,
          reply:
            "Respectfully disagree with this SHORT thesis. While the 4h chart shows bearish divergence, the weekly structure remains bullish. The Dencun upgrade catalysts haven't been fully priced in, and ETH staking yields are attracting institutional capital.",
        },
      } as ActionExample,
    ],
  ],
};

export default REPLY_SIGNAL_ACTION;
