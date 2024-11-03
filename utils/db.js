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
      const collection = this.db.collection("users"); // Access the users collection
      const count = await collection.countDocuments(); // Get the count of users
      return count; // Return the count of users
    } catch (err) {
      throw err; // Propagate the error
    }
  }

  async nbFiles() {
    try {
      const collection = this.db.collection("files"); // Access the files collection
      const count = await collection.countDocuments(); // Get the count of files
      return count; // Return the count of files
    } catch (err) {
      throw err; // Propagate the error
    }
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
