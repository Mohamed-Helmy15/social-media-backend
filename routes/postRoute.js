const express = require("express");
const {
  createPost,
  uploadImage,
  resizePostPhoto,
  getAllPosts,
  getMyPosts,
  getMyFriendsPosts,
  getMyFriendPosts,
  deletePost,
} = require("../controller/postController");
const likeRoute = require("../routes/likeRoute");
const commentRoute = require("../routes/commentRoute");
const { protect } = require("../controller/authController");

const router = express.Router();

router.use("/:postId/likes", likeRoute);
router.use("/:postId/comments", commentRoute);

router.route("/my-posts").get(protect, getMyPosts);
router.route("/my-friends-posts").get(protect, getMyFriendsPosts);
router.route("/:friendId").get(protect, getMyFriendPosts);

router
  .route("/")
  .get(protect, getAllPosts)
  .post(protect, uploadImage, resizePostPhoto, createPost);

router.route("/:postId").delete(protect, deletePost);

module.exports = router;
