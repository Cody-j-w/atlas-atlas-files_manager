const redisUtil = require("../utils/redis");
const dbClient = require("../utils/db");
const dbUtil = require("../utils/db");
const sha1 = require("sha1");

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
    // Call findUser from dbUtil
    const existingUser = await dbClient.findUser(email);
    if (existingUser) {
      return res.status(400).json({ error: "Already exists" });
    }

    const hashedPassword = sha1(password);

    const newUser = {
      email,
      password: hashedPassword,
    };

    const result = await dbClient.createUser(newUser);

    // Return only the email and MongoDB-generated id with status 201
    return res.status(201).json({ id: result.insertedId, email });
  }
}

module.exports = UsersController;
