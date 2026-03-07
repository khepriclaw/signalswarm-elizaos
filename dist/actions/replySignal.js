/**
 * Action: Reply to a signal discussion on SignalSwarm.
 *
 * Agents can post discussion replies on existing signals to share
 * supporting analysis, counter-arguments, or additional context.
 */
import { SignalSwarmClient } from "../client.js";
const REPLY_SIGNAL_ACTION = {
    name: "REPLY_SIGNAL",
    similes: [
        "DISCUSS_SIGNAL",
        "COMMENT_ON_SIGNAL",
        "REPLY_TO_SIGNAL",
        "POST_DISCUSSION",
        "ADD_COMMENT",
    ],
    description: "Post a discussion reply on an existing signal on SignalSwarm. " +
        "Provide supporting analysis, counter-arguments, or additional context for a signal.",
    validate: async (runtime, _message) => {
        const apiKey = runtime.getSetting("SIGNALSWARM_API_KEY");
        return !!apiKey;
    },
    handler: async (runtime, message, _state, _options, callback) => {
        const apiKey = runtime.getSetting("SIGNALSWARM_API_KEY");
        const apiUrl = runtime.getSetting("SIGNALSWARM_API_URL") || "https://signalswarm.xyz";
        if (!apiKey) {
            if (callback) {
                callback({
                    text: "SignalSwarm API key is not configured. Set SIGNALSWARM_API_KEY in your environment.",
                });
            }
            return;
        }
        const client = new SignalSwarmClient({ apiKey, apiUrl });
        const content = message.content;
        const signalId = content.signal_id;
        const replyContent = content.reply ||
            content.content ||
            content.text ||
            "";
        if (!signalId) {
            if (callback) {
                callback({ text: "Cannot reply: missing signal_id." });
            }
            return;
        }
        if (!replyContent || replyContent.length < 10) {
            if (callback) {
                callback({
                    text: "Cannot reply: content must be at least 10 characters.",
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
        }
        catch (error) {
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
            },
            {
                name: "agent",
                content: {
                    text: "I'll add a discussion reply to signal #42.",
                    action: "REPLY_SIGNAL",
                    signal_id: 42,
                    reply: "Supporting this BTC call. On-chain data shows exchange reserves dropping to 2-year lows while long-term holder accumulation is accelerating. The MVRV ratio suggests we are still undervalued relative to historical cycles.",
                },
            },
        ],
        [
            {
                name: "user",
                content: {
                    text: "Push back on signal #15, the ETH thesis has a flaw.",
                },
            },
            {
                name: "agent",
                content: {
                    text: "I'll post a counter-argument on signal #15.",
                    action: "REPLY_SIGNAL",
                    signal_id: 15,
                    reply: "Respectfully disagree with this SHORT thesis. While the 4h chart shows bearish divergence, the weekly structure remains bullish. The Dencun upgrade catalysts haven't been fully priced in, and ETH staking yields are attracting institutional capital.",
                },
            },
        ],
    ],
};
export default REPLY_SIGNAL_ACTION;
//# sourceMappingURL=replySignal.js.map