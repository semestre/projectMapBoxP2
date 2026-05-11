const express = require("express");
const router = express.Router();

const ZonesService = require("../services/zones.service");
const service = new ZonesService();

/**
 * @swagger
 * /zones:
 *   get:
 *     tags:
 *       - Zones
 *     summary: Get all zones
 *     responses:
 *       200:
 *         description: List of zones
 */
router.get("/", async (req, res) => {
  const zones = await service.getAll();
  res.json(zones);
});

/**
 * @swagger
 * /zones/{id}:
 *   get:
 *     tags:
 *       - Zones
 *     summary: Get a zone by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Zone found
 *       404:
 *         description: Zone not found
 */
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  const zone = await service.getById(id);

  if (!zone) {
    return res.status(404).json({
      message: "Zone not found"
    });
  }

  res.json(zone);
});

/**
 * @swagger
 * /zones:
 *   post:
 *     tags:
 *       - Zones
 *     summary: Create a new zone
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
 *         description: Zone created
 */
router.post("/", async (req, res) => {
  const newZone = await service.create(req.body);
  res.status(201).json(newZone);
});

/**
 * @swagger
 * /zones/{id}:
 *   patch:
 *     tags:
 *       - Zones
 *     summary: Update a zone
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
 *         description: Zone updated
 *       404:
 *         description: Zone not found
 */
router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const updatedZone = await service.update(id, req.body);
    res.json(updatedZone);
  } catch (error) {
    res.status(404).json({
      message: error.message
    });
  }
});

/**
 * @swagger
 * /zones/{id}:
 *   delete:
 *     tags:
 *       - Zones
 *     summary: Delete a zone
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Zone deleted
 *       404:
 *         description: Zone not found
 */
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const deletedZone = await service.delete(id);

    res.json({
      message: "Zone deleted successfully",
      data: deletedZone
    });
  } catch (error) {
    res.status(404).json({
      message: error.message
    });
  }
});

module.exports = router;
