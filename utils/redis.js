const redis = require("redis");

class RedisClient {
    constructor() {
        this.connected = false;
        this.client = redis.createClient();

        // Handle connection errors
        this.client.on('error', (err) => {
            console.log('Redis Client Error:', err);
        });

        // Handle successful connection
        this.client.on('connect', () => {
            this.connected = true;
            console.log('Connected to Redis');
        });
    }

    isAlive() {
        return this.connected;
    }

    async get(key) {
        return await this.client.get(key);
    }

    async set(key, value, duration) {
        await this.client.set(key, value);
        await this.client.expireat(key, duration);
    }

    async del(key) {
        await this.client.del(key);
    }
}

const redisClient = new RedisClient();

module.exports = redisClient;