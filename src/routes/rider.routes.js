const router = require("express").Router();
const rider = require("../controllers/rider.controller");
const auth = require("../middlewares/auth");
const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/riders");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `rider-${file.fieldname}-${Date.now()}.${ext}`);
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
]), rider.store);
// router.post("/", upload.single("file"), rider.store);

// fetch all
router.get("/", rider.list);

// fetch by parameter
router.get("/:id", rider.show);

// update rider by id
router.patch("/:id", upload.single("file"), rider.update);
router.patch("/:id/status", rider.updateStatus);

module.exports = router;
