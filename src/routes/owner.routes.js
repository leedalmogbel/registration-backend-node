const router = require("express").Router();
const owner = require("../controllers/owner.controller");
const auth = require("../middlewares/auth");
const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/owners");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `owner-${file.fieldname}-${Date.now()}.${ext}`);
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
router.post("/", upload.single("file"), owner.store);

// fetch all
router.get("/", owner.list);
router.get("/fill", owner.ownerAutoFill);

// fetch by parameter
router.get("/:id", owner.show);

// update owner by id
router.patch("/:id", upload.single("file"), owner.update);
router.patch("/:id/status", owner.updateStatus);


module.exports = router;
