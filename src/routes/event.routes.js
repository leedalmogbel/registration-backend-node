const router = require("express").Router();
const event = require("../controllers/event.controller");
const auth = require("../middlewares/auth");
const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/events");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `event-${file.fieldname}-${Date.now()}.${ext}`);
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
]), event.store);

// fetch all
router.get('/', event.list);

// fetch by parameter
router.get("/:id", event.show);
// update
router.patch("/:id/status", event.updateStatus);
// create
router.patch("/:id", upload.fields([{
    name:"file"
  }, {
    name: "photo"
  }
  ]), event.update);

module.exports = router