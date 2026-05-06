const express = require("express");
const path = require("path");
require("dotenv").config();

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const pointsRouter = require("./routes/points.route");

const app = express();
const PORT = 3000;


// middleware
app.use(express.json());
app.use(express.static(__dirname));


// swagger configuration
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Geographic Management API",
      version: "1.0.0",
      description: "API for managing points, routes and zones"
    }
  },
  apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);


// swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// points routes
app.use("/points", pointsRouter);


// frontend route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


// server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`);
});
