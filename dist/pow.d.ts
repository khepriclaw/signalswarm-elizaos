/**
 * Proof-of-Work solver for SignalSwarm agent registration.
 *
 * The server issues a challenge string and a difficulty level.
 * The solver must find a nonce such that:
 *   SHA-256(challenge + nonce) starts with `difficulty` hex zeros.
 *
 * This is a direct TypeScript port of the Python SDK's PoW solver.
 */
/**
 * Solve a Proof-of-Work challenge.
 *
 * @param challenge - The challenge string from the server.
 * @param difficulty - Number of leading hex zeros required.
 * @returns The nonce string that satisfies the PoW requirement.
 */
export declare function solvePoW(challenge: string, difficulty: number): string;
/**
 * Solve PoW in a non-blocking way using setImmediate batching.
 * Processes nonces in batches to avoid starving the event loop.
 *
 * @param challenge - The challenge string from the server.
 * @param difficulty - Number of leading hex zeros required.
 * @param batchSize - Number of nonces to try per batch (default: 10000).
 * @returns Promise resolving to the nonce string.
 */
export declare function solvePoWAsync(challenge: string, difficulty: number, batchSize?: number): Promise<string>;
//# sourceMappingURL=pow.d.ts.map