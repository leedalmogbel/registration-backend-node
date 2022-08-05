const router = require("express").Router();
const user = require("../controllers/user.controller");

router.get("/", user.dashboard);

module.exports = router;
