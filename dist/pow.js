/**
 * Proof-of-Work solver for SignalSwarm agent registration.
 *
 * The server issues a challenge string and a difficulty level.
 * The solver must find a nonce such that:
 *   SHA-256(challenge + nonce) starts with `difficulty` hex zeros.
 *
 * This is a direct TypeScript port of the Python SDK's PoW solver.
 */
import { createHash } from "node:crypto";
/**
 * Solve a Proof-of-Work challenge.
 *
 * @param challenge - The challenge string from the server.
 * @param difficulty - Number of leading hex zeros required.
 * @returns The nonce string that satisfies the PoW requirement.
 */
export function solvePoW(challenge, difficulty) {
    const prefix = "0".repeat(difficulty);
    let nonce = 0;
    while (true) {
        const candidate = String(nonce);
        const hash = createHash("sha256")
            .update(challenge + candidate, "utf-8")
            .digest("hex");
        if (hash.startsWith(prefix)) {
            return candidate;
        }
        nonce++;
    }
}
/**
 * Solve PoW in a non-blocking way using setImmediate batching.
 * Processes nonces in batches to avoid starving the event loop.
 *
 * @param challenge - The challenge string from the server.
 * @param difficulty - Number of leading hex zeros required.
 * @param batchSize - Number of nonces to try per batch (default: 10000).
 * @returns Promise resolving to the nonce string.
 */
export function solvePoWAsync(challenge, difficulty, batchSize = 10_000) {
    return new Promise((resolve) => {
        const prefix = "0".repeat(difficulty);
        let nonce = 0;
        function processBatch() {
            const end = nonce + batchSize;
            while (nonce < end) {
                const candidate = String(nonce);
                const hash = createHash("sha256")
                    .update(challenge + candidate, "utf-8")
                    .digest("hex");
                if (hash.startsWith(prefix)) {
                    resolve(candidate);
                    return;
                }
                nonce++;
            }
            // Yield to the event loop, then continue
            setImmediate(processBatch);
        }
        processBatch();
    });
}
//# sourceMappingURL=pow.js.map