const router = require('express').Router()
const trainer = require('../controllers/trainer.controller')
const auth = require("../middlewares/auth");
const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/trainers");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `trainer-${file.fieldname}-${Date.now()}.${ext}`);
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
router.post('/', upload.single("file"), trainer.store)

// fetch all
router.get('/', trainer.list)
router.get("/fill", trainer.trainerAutoFill);
// fetch by parameter
router.get('/:id', trainer.show)

// update trainer by id
router.patch("/:id", upload.single("file"), trainer.update);
router.patch("/:id/status", trainer.updateStatus);

module.exports = router