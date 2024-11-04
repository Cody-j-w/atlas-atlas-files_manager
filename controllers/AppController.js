const redisUtil = require("../utils/redis");
const dbUtil = require("../utils/db");

class AppController {
  static async getStatus(req, res) {
    const redisStatus = await redisUtil.isAlive();
    const dbStatus = await dbUtil.isAlive();

    // If the redis and db promises are fulfilled
    res.status(200).json({ redis: redisStatus, db: dbStatus });
  }

  static async getStats(req, res) {
    const userCount = await dbUtil.nbUsers();
    const fileCount = await dbUtil.nbFiles();

    res.status(200).json({ users: userCount, files: fileCount });
  }
}

module.exports = AppController;
