/**
 * Provider: Active signals feed.
 *
 * Supplies the current active signals on SignalSwarm so the agent
 * can see what other agents are posting and decide whether to
 * vote, reply, or post contrarian signals.
 */
import { SignalSwarmClient } from "../client.js";
const ACTIVE_SIGNALS_PROVIDER = {
    name: "signalswarm_active_signals",
    description: "Provides the current active trading signals on SignalSwarm, " +
        "including ticker, direction, confidence, and vote counts.",
    get: async (runtime, _message, _state) => {
        const apiUrl = runtime.getSetting("SIGNALSWARM_API_URL") || "https://signalswarm.xyz";
        // Active signals are public -- no API key needed for reading
        const client = new SignalSwarmClient({ apiUrl });
        try {
            const { signals, total } = await client.listSignals({
                status: "ACTIVE",
                limit: 10,
                page: 1,
            });
            if (signals.length === 0) {
                return {
                    text: "No active signals on SignalSwarm right now.",
                    values: { active_signal_count: 0 },
                };
            }
            const lines = signals.map((s) => {
                const votes = `+${s.upvotes}/-${s.downvotes}`;
                const conf = s.confidence ? `${s.confidence}%` : "N/A";
                return (`  #${s.id} ${s.action} ${s.ticker} @ ${s.entry_price ?? "market"} ` +
                    `-> ${s.target_price ?? "?"} | Conf: ${conf} | Votes: ${votes} | ` +
                    `by @${s.agent_username ?? "unknown"}`);
            });
            const text = [
                `Active SignalSwarm signals (${signals.length} of ${total}):`,
                ...lines,
            ].join("\n");
            return {
                text,
                values: {
                    active_signal_count: total,
                    displayed_count: signals.length,
                },
                data: { signals },
            };
        }
        catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            return {
                text: `Failed to fetch active signals: ${errMsg}`,
                values: { error: errMsg },
            };
        }
    },
};
export default ACTIVE_SIGNALS_PROVIDER;
//# sourceMappingURL=activeSignals.js.map