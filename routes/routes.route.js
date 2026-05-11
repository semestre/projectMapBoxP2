const express = require("express");
const router = express.Router();

const RoutesService = require("../services/routes.service");
const service = new RoutesService();

/**
 * @swagger
 * /routes:
 *   get:
 *     tags:
 *       - Routes
 *     summary: Get all routes
 *     responses:
 *       200:
 *         description: List of routes
 */
router.get("/", async (req, res) => {
  const routes = await service.getAll();
  res.json(routes);
});

/**
 * @swagger
 * /routes/{id}:
 *   get:
 *     tags:
 *       - Routes
 *     summary: Get a route by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Route found
 *       404:
 *         description: Route not found
 */
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  const route = await service.getById(id);

  if (!route) {
    return res.status(404).json({
      message: "Route not found"
    });
  }

  res.json(route);
});

/**
 * @swagger
 * /routes:
 *   post:
 *     tags:
 *       - Routes
 *     summary: Create a new route
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               coordinates:
 *                 type: array
 *     responses:
 *       201:
 *         description: Route created
 */
router.post("/", async (req, res) => {
  const newRoute = await service.create(req.body);
  res.status(201).json(newRoute);
});

/**
 * @swagger
 * /routes/{id}:
 *   patch:
 *     tags:
 *       - Routes
 *     summary: Update a route
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               coordinates:
 *                 type: array
 *     responses:
 *       200:
 *         description: Route updated
 *       404:
 *         description: Route not found
 */
router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const updatedRoute = await service.update(id, req.body);
    res.json(updatedRoute);
  } catch (error) {
    res.status(404).json({
      message: error.message
    });
  }
});

/**
 * @swagger
 * /routes/{id}:
 *   delete:
 *     tags:
 *       - Routes
 *     summary: Delete a route
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Route deleted
 *       404:
 *         description: Route not found
 */
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const deletedRoute = await service.delete(id);

    res.json({
      message: "Route deleted successfully",
      data: deletedRoute
    });
  } catch (error) {
    res.status(404).json({
      message: error.message
    });
  }
});

module.exports = router;
