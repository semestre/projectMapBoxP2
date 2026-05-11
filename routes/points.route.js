const express = require("express");
const router = express.Router();

const PointsService = require("../services/points.service");
const service = new PointsService();

/**
 * @swagger
 * /points:
 *   get:
 *     tags:
 *       - Points
 *     summary: Get all geographic points
 *     responses:
 *       200:
 *         description: List of points
 */
router.get("/", async (req, res) => {
  const points = await service.getAll();
  res.json(points);
});

/**
 * @swagger
 * /points/{id}:
 *   get:
 *     tags:
 *       - Points
 *     summary: Get a point by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Point found
 *       404:
 *         description: Point not found
 */
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  const point = await service.getById(id);

  if (!point) {
    return res.status(404).json({
      message: "Point not found"
    });
  }

  res.json(point);
});

/**
 * @swagger
 * /points:
 *   post:
 *     tags:
 *       - Points
 *     summary: Create a new geographic point
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
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *     responses:
 *       201:
 *         description: Point created
 */
router.post("/", async (req, res) => {
  const newPoint = await service.create(req.body);
  res.status(201).json(newPoint);
});

/**
 * @swagger
 * /points/{id}:
 *   patch:
 *     tags:
 *       - Points
 *     summary: Update a point
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
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *     responses:
 *       200:
 *         description: Point updated
 *       404:
 *         description: Point not found
 */
router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const updatedPoint = await service.update(id, req.body);
    res.json(updatedPoint);
  } catch (error) {
    res.status(404).json({
      message: error.message
    });
  }
});

/**
 * @swagger
 * /points/{id}:
 *   delete:
 *     tags:
 *       - Points
 *     summary: Delete a point
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Point deleted
 *       404:
 *         description: Point not found
 */
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const deletedPoint = await service.delete(id);

    res.json({
      message: "Point deleted successfully",
      data: deletedPoint
    });
  } catch (error) {
    res.status(404).json({
      message: error.message
    });
  }
});

module.exports = router;
