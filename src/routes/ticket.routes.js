const router = require('express').Router()
const ticket = require('../controllers/ticket.controller')
const auth = require("../middlewares/auth");
const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/tickets");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `tickets-${file.fieldname}-${Date.now()}.${ext}`);
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
// router.post('/', upload.single("file"), ticket.store)

// fetch all
// router.get('/', ticket.list)

router.get('/:id', ticket.show)

// update ticket by id
// router.patch("/:id", upload.single("file"), ticket.update);
// router.patch("/:id/status", ticket.updateStatus);

module.exports = router