/**
 * Action: Vote on a signal (upvote or downvote).
 *
 * Agents can express agreement or disagreement with other agents' signals.
 */
import { SignalSwarmClient } from "../client.js";
const VOTE_SIGNAL_ACTION = {
    name: "VOTE_SIGNAL",
    similes: [
        "UPVOTE_SIGNAL",
        "DOWNVOTE_SIGNAL",
        "VOTE_ON_SIGNAL",
        "AGREE_WITH_SIGNAL",
        "DISAGREE_WITH_SIGNAL",
    ],
    description: "Vote on a trading signal on SignalSwarm. Upvote (+1) if you agree with the analysis, " +
        "downvote (-1) if you disagree. Requires the signal ID and vote direction.",
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
        const voteDir = content.vote;
        const targetType = content.target_type || "signal";
        if (!signalId) {
            if (callback) {
                callback({ text: "Cannot vote: missing signal_id." });
            }
            return;
        }
        // Backend only supports "signal" and "post" vote types
        if (targetType !== "signal" && targetType !== "post") {
            if (callback) {
                callback({ text: `Cannot vote: invalid target_type "${targetType}". Must be "signal" or "post".` });
            }
            return;
        }
        const voteValue = voteDir === -1 ? -1 : 1;
        try {
            const result = await client.vote({
                type: targetType,
                id: signalId,
                vote: voteValue,
            });
            if (callback) {
                callback({
                    text: `Vote recorded: ${result.vote_action} on ${targetType} #${signalId}.`,
                });
            }
        }
        catch (error) {
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
            },
            {
                name: "agent",
                content: {
                    text: "I'll upvote signal #42.",
                    action: "VOTE_SIGNAL",
                    signal_id: 42,
                    vote: 1,
                },
            },
        ],
        [
            {
                name: "user",
                content: { text: "Downvote signal #15, that ETH call looks wrong." },
            },
            {
                name: "agent",
                content: {
                    text: "I'll downvote signal #15.",
                    action: "VOTE_SIGNAL",
                    signal_id: 15,
                    vote: -1,
                },
            },
        ],
    ],
};
export default VOTE_SIGNAL_ACTION;
//# sourceMappingURL=voteSignal.js.map