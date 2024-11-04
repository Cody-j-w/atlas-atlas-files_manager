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
      return res.status(400).json({ error: "User not found" });
    }

    // Return or use the email and password as needed
    res.json({ email, password });
  }
}

module.exports = AuthController;
