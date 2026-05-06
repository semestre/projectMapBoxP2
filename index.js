const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 3000;

// Serve CSS, JS, images, folders, etc.
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "map.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`);
});
