const FIRST_DELAY = 1000;
const MAX_WAIT = 60 * 1000;

export function calculateBackoff(attempt: number) {
    const exponentialWaitTime = FIRST_DELAY * Math.pow(2, attempt - 1);
    const baseWaitTime = Math.min(MAX_WAIT, exponentialWaitTime);
    
    // Add a bit of noise to prevent thundering horde.
    const jitter = Math.floor(Math.random() * baseWaitTime * 0.25);

    return baseWaitTime + jitter;
}
