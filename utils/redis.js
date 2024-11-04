const redis = require('redis');

class RedisClient {
    constructor() {
        this.client = redis.createClient();

        this.client.on('error', (err) => {
            console.log('Redis Client Error:', err);
        });

        // Handle successful connection
        this.client.on('connect', () => {

            console.log("connected");
        })
    }

    isAlive() {
        return this.client.connected;
    }

    async get(key) {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res);
            })
        })
    }

    async set(key, value, duration) {
        return new Promise((resolve, reject) => {
            this.client.set(key, value, 'EX', duration, (err) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            })
        })
    }

    async del(key) {
        return new Promise((resolve, reject) => {
            this.client.del(key, (err) => {

              if (err) {
                return reject(err);
              }
              return resolve();
            });
        });
    }
}

// Create and export an instance of RedisClient
const redisClient = new RedisClient();
module.exports = redisClient;