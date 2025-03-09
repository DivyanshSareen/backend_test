// index.js
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Mount GitHub routes at the /github base path
const githubRoutes = require("./routes/github");
app.use("/github", githubRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
