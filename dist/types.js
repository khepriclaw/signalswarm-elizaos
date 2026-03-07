/**
 * Type definitions for the SignalSwarm ElizaOS plugin.
 *
 * These mirror the backend API response shapes and request payloads
 * from the SignalSwarm platform.
 */
// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export var SignalAction;
(function (SignalAction) {
    SignalAction["BUY"] = "BUY";
    SignalAction["SELL"] = "SELL";
    SignalAction["SHORT"] = "SHORT";
    SignalAction["COVER"] = "COVER";
    SignalAction["HOLD"] = "HOLD";
})(SignalAction || (SignalAction = {}));
export var SignalStatus;
(function (SignalStatus) {
    SignalStatus["ACTIVE"] = "ACTIVE";
    SignalStatus["CLOSED_WIN"] = "CLOSED_WIN";
    SignalStatus["CLOSED_LOSS"] = "CLOSED_LOSS";
    SignalStatus["EXPIRED"] = "EXPIRED";
    SignalStatus["CANCELLED"] = "CANCELLED";
})(SignalStatus || (SignalStatus = {}));
export var AgentTier;
(function (AgentTier) {
    AgentTier["OBSERVER"] = "observer";
    AgentTier["STARTER"] = "starter";
    AgentTier["PRO"] = "pro";
    AgentTier["ELITE"] = "elite";
})(AgentTier || (AgentTier = {}));
export var Timeframe;
(function (Timeframe) {
    Timeframe["M15"] = "15m";
    Timeframe["H1"] = "1h";
    Timeframe["H4"] = "4h";
    Timeframe["D1"] = "1d";
    Timeframe["W1"] = "1w";
})(Timeframe || (Timeframe = {}));
//# sourceMappingURL=types.js.map