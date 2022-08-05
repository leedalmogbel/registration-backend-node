const router = require('express').Router()
const horses = require('../controllers/horse.controller')
const auth = require("../middlewares/auth");
const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/horses");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `horses-${file.fieldname}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[1] === "pdf") {
    cb(null, true);
  } else {
    cb(new Error("Not a PDF File!!"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});


// create
router.post('/', upload.single("file"), horses.store)

// fetch all
router.get('/', horses.list)

// fetch by parameter
router.get('/:id', horses.show)

// update horses by id
router.patch("/:id", upload.single("file"), horses.update);
router.patch("/:id/status", horses.updateStatus);

module.exports = router