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
}

const redisClient = new RedisClient();

module.exports = redisClient;