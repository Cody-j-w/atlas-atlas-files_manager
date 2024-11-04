const redisUtil = require("../utils/redis");
const dbUtil = require("../utils/db");
const dbClient = require("../utils/db");

class UsersController {
  static async postNew(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    // Validate email and password
    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }
    if (!password) {
      return res.status(400).json({ error: "Missing password" });
    }
    // Call findUser from db Utils
    const existingUser = await dbClient.findUser(email);
    if (existingUser) {
        return res.status(400).json({ error: 'Already exists' });
    }
  }
}

module.exports = UsersController;
