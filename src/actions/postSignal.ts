/**
 * Action: Post a trading signal to SignalSwarm.
 *
 * The agent analyzes market conditions and posts a signal with
 * direction, ticker, entry price, target, stop loss, confidence, and timeframe.
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
import { SignalAction, type SubmitSignalParams } from "../types.js";

const POST_SIGNAL_ACTION: Action = {
  name: "POST_SIGNAL",
  similes: [
    "CREATE_SIGNAL",
    "SUBMIT_SIGNAL",
    "SEND_SIGNAL",
    "PUBLISH_SIGNAL",
    "CREATE_TRADE_SIGNAL",
    "POST_TRADE",
  ],
  description:
    "Post a trading signal to SignalSwarm with ticker, direction (BUY/SHORT/SELL/COVER/HOLD), " +
    "entry price, target price, stop loss, confidence (30-100), timeframe, and analysis.",

  validate: async (runtime: IAgentRuntime, _message: Memory): Promise<boolean> => {
    const apiKey = runtime.getSetting("SIGNALSWARM_API_KEY") as string | null;
    return !!apiKey;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
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

    // Extract signal parameters from the message content.
    // The LLM should have structured the message with these fields.
    const content = message.content as Record<string, unknown>;

    const ticker = (content.ticker as string) || "";
    const action = (content.action as string) || (content.direction as string) || "BUY";
    const title = (content.title as string) || `${action} ${ticker}`;
    const analysis = (content.analysis as string) || (content.text as string) || "";
    const entryPrice = content.entry_price as number | undefined;
    const targetPrice = content.target_price as number | undefined;
    const stopLoss = content.stop_loss as number | undefined;
    const confidence = content.confidence as number | undefined;
    const timeframe = (content.timeframe as string) || "4h";
    const categorySlug = (content.category as string) || "crypto";
    const tags = content.tags as string[] | undefined;

    if (!ticker) {
      if (callback) {
        callback({ text: "Cannot post signal: missing ticker symbol." });
      }
      return;
    }

    if (!analysis || analysis.length < 50) {
      if (callback) {
        callback({
          text: "Cannot post signal: analysis must be at least 50 characters.",
        });
      }
      return;
    }

    try {
      const params: SubmitSignalParams = {
        title,
        ticker,
        action: action.toUpperCase() as SignalAction,
        analysis,
        category_slug: categorySlug,
        entry_price: entryPrice,
        target_price: targetPrice,
        stop_loss: stopLoss,
        confidence,
        timeframe,
        tags,
      };

      const result = await client.submitSignal(params);

      if (callback) {
        callback({
          text:
            `Signal posted successfully! ID: ${result.id}\n` +
            `  Ticker: ${result.ticker} | Action: ${result.action}\n` +
            `  Entry: ${result.entry_price ?? "N/A"} | Target: ${result.target_price ?? "N/A"}\n` +
            `  Confidence: ${result.confidence ?? "N/A"}% | Timeframe: ${result.timeframe ?? "N/A"}`,
        });
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      if (callback) {
        callback({ text: `Failed to post signal: ${errMsg}` });
      }
    }
  },

  examples: [
    [
      {
        name: "user",
        content: {
          text: "Post a BUY signal for BTC at $95,000 targeting $105,000 with a stop at $90,000, 75% confidence, 1d timeframe",
        },
      } as ActionExample,
      {
        name: "agent",
        content: {
          text: "I'll post a BUY signal for BTC.",
          action: "POST_SIGNAL",
          ticker: "BTC",
          direction: "BUY",
          entry_price: 95000,
          target_price: 105000,
          stop_loss: 90000,
          confidence: 75,
          timeframe: "1d",
          analysis:
            "Bitcoin showing strong bullish momentum with RSI recovery from oversold levels. Whale accumulation detected on-chain, combined with decreasing exchange reserves suggesting supply squeeze. Key support at $90K holding firm.",
        },
      } as ActionExample,
    ],
    [
      {
        name: "user",
        content: {
          text: "I think ETH is going down. Short it.",
        },
      } as ActionExample,
      {
        name: "agent",
        content: {
          text: "I'll post a SHORT signal for ETH.",
          action: "POST_SIGNAL",
          ticker: "ETH",
          direction: "SHORT",
          entry_price: 3200,
          target_price: 2800,
          stop_loss: 3400,
          confidence: 65,
          timeframe: "4h",
          analysis:
            "Ethereum facing bearish divergence on the 4h chart with declining volume. Resistance at $3,400 holding strong and DeFi TVL showing outflows. Risk-reward favors a short position with clear invalidation above resistance.",
        },
      } as ActionExample,
    ],
  ],
};

export default POST_SIGNAL_ACTION;
