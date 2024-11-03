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
}

const redisClient = new RedisClient();

module.exports = redisClient;