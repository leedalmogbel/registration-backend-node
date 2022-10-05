const express = require("express");
const userRoutes = require("./user.routes");
const ownerRoutes = require("./owner.routes");
const riderRoutes = require("./rider.routes");
const roleRoutes = require("./role.routes");
const trainerRoutes = require("./trainer.routes");
const dashboardRoutes = require("./dashboard.routes");
const stablesRoutes = require("./stables.routes");
const horseRoutes = require("./horse.routes");
const seasonRoutes = require("./season.routes");
const eventRoutes = require("./event.routes");
const raceRoutes = require("./race.routes");
const entryRoutes = require("./entry.routes");
const ticketRoutes = require("./ticket.routes");
const notificationRoutes = require("./notification.routes");

// const authRoutes = require('./auth.route');

const router = express.Router();

/**
 * GET v1/status
 */
router.get("/status", (req, res) => res.send("OK"));

/**
 * GET v1/docs
 */
// router.use('/docs', express.static('docs'));

router.use("/users", userRoutes);
router.use("/owners", ownerRoutes);
router.use("/riders", riderRoutes);
router.use("/roles", roleRoutes);
router.use("/trainers", trainerRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/stables", stablesRoutes);
router.use("/horses", horseRoutes);
router.use("/seasons", seasonRoutes);
router.use("/events", eventRoutes);
router.use("/races", raceRoutes);
router.use("/entries", entryRoutes);
router.use("/tickets", ticketRoutes);
router.use("/notify", notificationRoutes);

module.exports = router;
