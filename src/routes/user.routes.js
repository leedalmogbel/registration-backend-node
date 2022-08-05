const router = require("express").Router();
const user = require("../controllers/user.controller");
const auth = require("../middlewares/auth");
const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `signup/user-${file.fieldname}-${Date.now()}.${ext}`);
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

// register
router.post("/", upload.single("file"), user.register);

// login
router.post("/login", user.login);
router.get("/refresh", user.handleRefreshToken);
// fetch all users
router.get("/", user.all);

// change status user
router.patch("/:id/status", user.updateStatus);
router.patch("/:id", upload.single("file"), user.updateUserDetail);

router.get("/:id", user.fetchUser);

router.post("/forgot-password", user.forgotPassword);
router.post("/change-password", user.changePassword);

module.exports = router;
