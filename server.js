const express = require("express");
const app = express();

const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Use all available routes
const routes = require("./routes/index");
app.use("/", routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
