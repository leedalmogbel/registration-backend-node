const router = require('express').Router()
const stable = require('../controllers/stable.controller')
const auth = require("../middlewares/auth");
const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/stables");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `stables-${file.fieldname}-${Date.now()}.${ext}`);
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
router.post('/', upload.single("file"), stable.store)

// fetch all
router.get('/', stable.list)

router.get('/:id', stable.show)

// update stable by id
router.patch("/:id", upload.single("file"), stable.update);
router.patch("/:id/status", stable.updateStatus);

module.exports = router