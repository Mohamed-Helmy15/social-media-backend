const express = require("express");
const {
  addComment,
  removeComment,
} = require("../controller/CommentController");
const { protect } = require("../controller/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/:commentId?")
  .post(protect, addComment)
  .delete(protect, removeComment);

module.exports = router;
