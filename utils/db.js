import MongoClient from "mongodb/lib/mongo_client";

console.log(process.env.CONNECTION_URI);

class DBClient {
    host='localhost';
    port=27017;
    database='files_manager';
    client = null;
    connected = false;
    uri = process.env.CONNECTION_URI;

    constructor(host, port, database) {
        if (host) this.host = host;
        if (port) this.port = port;
        if (database) this.database = database;
        this.client = new MongoClient(this.uri);
        this.client.connect();
        this.client.on('open', () => {
            console.log('connected');
            this.connected = true;
            this.db = this.client.db(this.database);
        });
    }

    isAlive() {
        if (this.connected) {
            return true;
        }
        else {
            return false;
        }
    }

    async nbUsers() {
        try {
            const collection = this.db.collection('users');
            const response = await collection.find({}).toArray();
            return response;
        } catch (err) {
            throw err;
        }
    }
    async nbFiles() {
        try {
            const collection = this.db.collection('files');
            const result = await collection.find({}).toArray();
            return result;
        } catch (err) {
            throw err;
        }
    }

}

const dbClient = new DBClient();
module.exports = dbClient;