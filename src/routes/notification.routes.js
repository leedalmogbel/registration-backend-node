const router = require("express").Router();
const notification = require("../controllers/notification.controller");

router.get("/", notification.list);

module.exports = router;
