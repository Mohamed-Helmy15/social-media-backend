const express = require("express");
const { giveLike, removeLike } = require("../controller/likeController");
const { protect } = require("../controller/authController");

const router = express.Router({ mergeParams: true });

router.route("/").post(protect, giveLike).delete(protect, removeLike);

module.exports = router;
