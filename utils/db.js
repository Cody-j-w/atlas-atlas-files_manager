const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");
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
      return count;
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

  async findUser(email) {
    try {
      const userCollection = this.db.collection("users");
      const user = await userCollection.findOne({ email });
      return user;
    } catch (err) {
      throw err;
    }
  }

  async findEmail(userId) {
    try {
        const userCollection = this.db.collection("users");

        // Convert userId to ObjectId if necessary
        const query = { _id: ObjectId.isValid(userId) ? new ObjectId(userId) : userId };

        // Find a user document by user ID, projecting only the email field
        const user = await userCollection.findOne(
            query,
            { projection: { email: 1 } }
        );
        return user;
    } catch (err) {
        throw err;
    }
}

  async createUser(user) {
    try {
      const userCollection = this.db.collection("users");
      const result = await userCollection.insertOne(user);
      return result;
    } catch (err) {
      throw err;
    }
  }

  async createFile(file) {
      try {
        const fileCollection = this.db.collection("files");
        const result = await fileCollection.insertOne(file);
        return result;
      } catch (err) {
        throw err;
      }
  }

  async findFile(fileId) {
    try {
      const fileCollection = this.db.collection("files");
      const result = await fileCollection.findOne({_id: ObjectId(fileId)});

      return result;
    } catch (err) {
      throw err;
    }
  }

  async findFileByUserId(fileId, userId) {
    try {
      const fileCollection = this.db.collection("files");
      const result = await fileCollection.findOne({_id: ObjectId(fileId), userId: userId});
      return result;
    } catch (err) {
      throw err;
    }
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
