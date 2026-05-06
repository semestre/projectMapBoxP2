const express = require("express");
const path = require("path");
require("dotenv").config();


const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "map.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
