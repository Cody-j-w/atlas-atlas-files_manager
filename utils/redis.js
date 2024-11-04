import { createClient } from "redis";

class RedisClient {
    connected = false;
    constructor() {
        this.client = new createClient();
        this.client.on('error', (err) => {
            console.log(err);
        });
        this.client.on('connect', () => {
            this.connected = true;
        })
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