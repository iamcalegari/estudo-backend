require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true, // For mongoose >= v5.0.0
}); // Connect to MongoDB

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan("dev")); // Log requests to the console

app.use(require("./routes")); // Import routes

app.use(
  "/files",
  express.static(path.resolve(__dirname, "..", "tmp", "uploads"))
); // Serve static files from the "tmp/uploads" folder (e.g. uploaded images)

app.listen(3000, () => {
  console.clear();
  console.log("🚀 - App listening on port 3000!");
});
