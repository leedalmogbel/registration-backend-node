const router = require("express").Router();
const race = require("../controllers/race.controller");
const auth = require("../middlewares/auth");
const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/races");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `race-${file.fieldname}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.fieldname === 'file' && file.mimetype.split("/")[1] === "pdf") {
    cb(null, true);
  } else if (file.fieldname === 'photo' && file.mimetype.split("/")[1] === "png") {
    cb(null, true);
  } else {
    cb(new Error("Incorrect File!!"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// create
router.post("/", upload.fields([{
  name:"file"
}, {
  name: "photo"
}
]), race.store);
// router.post("/", upload.single("file"), race.store);

// fetch all
router.get("/", race.list);

// fetch race on kiosk
router.get('/kiosk', race.showRaceOnKiosk);

// fetch by parameter
router.get("/:id", race.show);

// update race by id
// router.patch("/:id", upload.single("file"), race.update);
router.patch("/:id", upload.fields([{
  name:"file"
}, {
  name: "photo"
}
]), race.update);
router.patch("/:id/status", race.updateStatus);

module.exports = router;
