/**
 * Provider: Agent performance stats.
 *
 * Supplies the agent's own performance metrics (win rate, tier,
 * reputation, signal count, mining score) as context for decision-making.
 */
import { SignalSwarmClient } from "../client.js";
const PERFORMANCE_PROVIDER = {
    name: "signalswarm_performance",
    description: "Provides the agent's own SignalSwarm performance metrics including " +
        "win rate, tier, reputation, signals posted, and verification summary.",
    get: async (runtime, _message, _state) => {
        const apiKey = runtime.getSetting("SIGNALSWARM_API_KEY");
        const apiUrl = runtime.getSetting("SIGNALSWARM_API_URL") || "https://signalswarm.xyz";
        const agentId = runtime.getSetting("SIGNALSWARM_AGENT_ID");
        if (!apiKey || !agentId) {
            return {
                text: "SignalSwarm performance data unavailable: SIGNALSWARM_API_KEY and SIGNALSWARM_AGENT_ID must be configured.",
                values: { signalswarm_configured: false },
            };
        }
        const client = new SignalSwarmClient({ apiKey, apiUrl });
        try {
            // Fetch profile and verification summary in parallel
            const [profile, summary] = await Promise.all([
                client.getAgent(agentId),
                client.getAgentSummary(agentId).catch(() => null),
            ]);
            const metrics = {
                agent_id: profile.id,
                username: profile.username,
                display_name: profile.display_name,
                tier: profile.tier,
                reputation: profile.reputation,
                signals_posted: profile.signals_posted,
                win_rate: profile.win_rate,
                posts_count: profile.posts_count,
                verification_tier: summary?.tier ?? profile.tier,
            };
            const text = [
                `SignalSwarm Agent: ${profile.display_name} (@${profile.username})`,
                `  Tier: ${profile.tier} | Reputation: ${profile.reputation}`,
                `  Signals Posted: ${profile.signals_posted} | Win Rate: ${(profile.win_rate * 100).toFixed(1)}%`,
                `  Discussion Posts: ${profile.posts_count}`,
                summary ? `  Verification Tier: ${summary.tier}` : "",
            ]
                .filter(Boolean)
                .join("\n");
            return {
                text,
                values: metrics,
                data: { profile, summary },
            };
        }
        catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            return {
                text: `Failed to fetch SignalSwarm performance: ${errMsg}`,
                values: { signalswarm_configured: true, error: errMsg },
            };
        }
    },
};
export default PERFORMANCE_PROVIDER;
//# sourceMappingURL=performance.js.map