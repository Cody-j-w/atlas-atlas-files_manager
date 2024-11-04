const { MongoClient } = require("mongodb");
require("dotenv").config();

console.log(process.env.CONNECTION_URI);

class DBClient {
  constructor(host, port, database) {
    this.host = host || "localhost";
    this.port = port || 27017;
    this.database = database || "files_manager";
    this.client = null;
    this.connected = false;
    this.uri = process.env.CONNECTION_URI;

    this.client = new MongoClient(this.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    this.client.connect((err) => {
      if (err) {
        console.error("MongoDB connection error:", err);
      } else {
        console.log("Connected to MongoDB");
        this.connected = true;
        this.db = this.client.db(this.database);
      }
    });
  }

  isAlive() {
    return this.connected;
  }

  async nbUsers() {
    try {
      const collection = this.db.collection("users");
      const count = await collection.countDocuments();
    } catch (err) {
      throw err;
    }
  }

  async nbFiles() {
    try {
      const collection = this.db.collection("files");
      const count = await collection.countDocuments();
      return count;
    } catch (err) {
      throw err;
    }
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
