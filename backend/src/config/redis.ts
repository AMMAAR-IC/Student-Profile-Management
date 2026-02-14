import { logger } from '../utils/logger';

// Redis stub for development - replace with ioredis in production
class RedisStub {
    private store: Map<string, { value: string; expiry?: number }> = new Map();

    async get(key: string): Promise<string | null> {
        const item = this.store.get(key);
        if (!item) return null;
        if (item.expiry && Date.now() > item.expiry) {
            this.store.delete(key);
            return null;
        }
        return item.value;
    }

    async set(key: string, value: string, mode?: string, ttl?: number): Promise<void> {
        const expiry = ttl ? Date.now() + ttl * 1000 : undefined;
        this.store.set(key, { value, expiry });
    }

    async del(key: string): Promise<void> {
        this.store.delete(key);
    }

    async flushall(): Promise<void> {
        this.store.clear();
    }

    async keys(pattern: string): Promise<string[]> {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return Array.from(this.store.keys()).filter((k) => regex.test(k));
    }
}

// Use in-memory stub for now — swap to real Redis with ioredis when ready
export const redis = new RedisStub();

logger.info('Using in-memory Redis stub (install ioredis for production)');
