/**
 * Object Utilities
 */

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;

    if (obj instanceof Date) {
        return new Date(obj.getTime()) as T;
    }

    if (obj instanceof Array) {
        return obj.map(item => deepClone(item)) as T;
    }

    if (obj instanceof Object) {
        const clonedObj = {} as T;
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }

    return obj;
}

/**
 * Deep merge two objects
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const output = { ...target };

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key) => {
            const sourceValue = source[key as keyof T];
            const targetValue = target[key as keyof T];

            if (isObject(sourceValue) && isObject(targetValue)) {
                output[key as keyof T] = deepMerge(
                    targetValue as Record<string, any>,
                    sourceValue as Record<string, any>
                ) as T[keyof T];
            } else {
                output[key as keyof T] = sourceValue as T[keyof T];
            }
        });
    }

    return output;
}

/**
 * Check if value is an object
 */
export function isObject(item: unknown): item is Record<string, any> {
    return item !== null && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Pick specific keys from object
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
}

/**
 * Omit specific keys from object
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
): Omit<T, K> {
    const result = { ...obj };
    keys.forEach(key => {
        delete result[key];
    });
    return result;
}

/**
 * Get nested value from object by path
 */
export function get<T = any>(
    obj: Record<string, any>,
    path: string,
    defaultValue?: T
): T | undefined {
    const keys = path.split('.');
    let result: any = obj;

    for (const key of keys) {
        if (result === null || result === undefined) {
            return defaultValue;
        }
        result = result[key];
    }

    return result !== undefined ? result : defaultValue;
}

/**
 * Set nested value in object by path
 */
export function set(
    obj: Record<string, any>,
    path: string,
    value: any
): Record<string, any> {
    const keys = path.split('.');
    const lastKey = keys.pop()!;

    let current = obj;
    for (const key of keys) {
        if (!(key in current) || !isObject(current[key])) {
            current[key] = {};
        }
        current = current[key];
    }

    current[lastKey] = value;
    return obj;
}

/**
 * Check if object has nested property
 */
export function has(obj: Record<string, any>, path: string): boolean {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
        if (!current || !(key in current)) {
            return false;
        }
        current = current[key];
    }

    return true;
}

/**
 * Convert object to query string
 */
export function objectToQueryString(obj: Record<string, any>): string {
    const params = new URLSearchParams();

    Object.entries(obj).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            if (Array.isArray(value)) {
                value.forEach(v => params.append(key, String(v)));
            } else {
                params.append(key, String(value));
            }
        }
    });

    return params.toString();
}

/**
 * Convert query string to object
 */
export function queryStringToObject(query: string): Record<string, string | string[]> {
    const params = new URLSearchParams(query);
    const result: Record<string, string | string[]> = {};

    params.forEach((value, key) => {
        if (key in result) {
            const existing = result[key];
            if (Array.isArray(existing)) {
                result[key] = [...existing, value];
            } else if (typeof existing === 'string') {
                result[key] = [existing, value];
            }
        } else {
            result[key] = value;
        }
    }); return result;
}

/**
 * Remove undefined/null values from object
 */
export function compact<T extends Record<string, any>>(obj: T): Partial<T> {
    const result: Partial<T> = {};

    Object.entries(obj).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            result[key as keyof T] = value;
        }
    });

    return result;
}
