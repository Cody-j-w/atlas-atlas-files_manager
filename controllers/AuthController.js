const { v4: uuidv4 } = require("uuid");
const dbClient = require("../utils/db");
const redisClient = require("../utils/redis.js");

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Basic") {
      return null;
    }

    // Decode the base64 string
    const decoded = Buffer.from(parts[1], "base64").toString("utf-8");
    const [email, password] = decoded.split(":");

    if (!email) {
      return res.status(401).json({ error: "User not found" });
    } else {
      const token = uuidv4();
      const redisKey = `auth_${token}`;
      const user = await dbClient.findUser(email);
      const userId = user._id;
      console.log(user);
      await redisClient.set(redisKey, userId.toString(), 86400);
      res.status(200).json({ token });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.headers["x-token"];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    } else {
      const redisKey = `auth_${token}`;
      await redisClient.del(redisKey);
      res.sendStatus(204);
    }
  }
}

module.exports = AuthController;
