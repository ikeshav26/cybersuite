/**
 * Async Utilities
 */

/**
 * Delay execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry async function with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: {
        maxAttempts?: number;
        initialDelay?: number;
        maxDelay?: number;
        backoffFactor?: number;
        onRetry?: (error: Error, attempt: number) => void;
    } = {}
): Promise<T> {
    const {
        maxAttempts = 3,
        initialDelay = 1000,
        maxDelay = 10000,
        backoffFactor = 2,
        onRetry,
    } = options;

    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt === maxAttempts) {
                throw lastError;
            }

            if (onRetry) {
                onRetry(lastError, attempt);
            }

            const delayMs = Math.min(
                initialDelay * Math.pow(backoffFactor, attempt - 1),
                maxDelay
            );
            await delay(delayMs);
        }
    }

    throw lastError!;
}

/**
 * Timeout promise - reject if takes too long
 */
export async function timeout<T>(
    promise: Promise<T>,
    ms: number,
    errorMessage: string = 'Operation timed out'
): Promise<T> {
    let timeoutId: NodeJS.Timeout;

    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(errorMessage));
        }, ms);
    });

    try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutId!);
        return result;
    } catch (error) {
        clearTimeout(timeoutId!);
        throw error;
    }
}

/**
 * Execute promises in parallel with concurrency limit
 */
export async function parallelLimit<T, R>(
    items: T[],
    limit: number,
    fn: (item: T) => Promise<R>
): Promise<R[]> {
    const results: R[] = [];
    const executing: Promise<void>[] = [];

    for (const [index, item] of items.entries()) {
        const promise = fn(item).then(result => {
            results[index] = result;
        });

        executing.push(promise);

        if (executing.length >= limit) {
            await Promise.race(executing);
            executing.splice(
                executing.findIndex(p => p === promise),
                1
            );
        }
    }

    await Promise.all(executing);
    return results;
}

/**
 * Execute async functions sequentially
 */
export async function sequential<T>(
    fns: Array<() => Promise<T>>
): Promise<T[]> {
    const results: T[] = [];

    for (const fn of fns) {
        results.push(await fn());
    }

    return results;
}

/**
 * Debounce async function
 */
export function debounce<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    ms: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    let timeoutId: NodeJS.Timeout | null = null;
    let latestResolve: ((value: ReturnType<T>) => void) | null = null;
    let latestReject: ((error: any) => void) | null = null;

    return (...args: Parameters<T>): Promise<ReturnType<T>> => {
        return new Promise((resolve, reject) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            latestResolve = resolve;
            latestReject = reject;

            timeoutId = setTimeout(async () => {
                try {
                    const result = await fn(...args);
                    if (latestResolve) {
                        latestResolve(result);
                    }
                } catch (error) {
                    if (latestReject) {
                        latestReject(error);
                    }
                }
            }, ms);
        });
    };
}

/**
 * Throttle async function
 */
export function throttle<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    ms: number
): (...args: Parameters<T>) => Promise<ReturnType<T> | undefined> {
    let lastRun = 0;
    let timeoutId: NodeJS.Timeout | null = null;

    return async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
        const now = Date.now();

        if (now - lastRun >= ms) {
            lastRun = now;
            return await fn(...args);
        }

        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        return new Promise((resolve) => {
            timeoutId = setTimeout(async () => {
                lastRun = Date.now();
                const result = await fn(...args);
                resolve(result);
            }, ms - (now - lastRun));
        });
    };
}

/**
 * Memoize async function results
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options: {
        maxAge?: number;
        keyFn?: (...args: Parameters<T>) => string;
    } = {}
): T {
    const cache = new Map<string, { value: any; timestamp: number }>();
    const { maxAge, keyFn = (...args) => JSON.stringify(args) } = options;

    return (async (...args: Parameters<T>) => {
        const key = keyFn(...args);
        const cached = cache.get(key);

        if (cached) {
            if (!maxAge || Date.now() - cached.timestamp < maxAge) {
                return cached.value;
            }
            cache.delete(key);
        }

        const value = await fn(...args);
        cache.set(key, { value, timestamp: Date.now() });
        return value;
    }) as T;
}
