const router = require("express").Router();
const entry = require("../controllers/entry.controller");
const auth = require("../middlewares/auth");
const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/entries");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `entry-${file.fieldname}-${Date.now()}.${ext}`);
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
]), entry.store);

// fetch all
router.get('/', entry.list);

// fetch by parameter
router.get("/manage", entry.manage);

// fetch by parameter
router.get("/:id", entry.show);


// update
router.patch("/:id/status", entry.updateStatus);
router.patch("/:id/save", entry.updateList);

router.get("/:id/export", entry.export);

module.exports = router