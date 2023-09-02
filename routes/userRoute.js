const express = require("express");
const {
  getAllUsers,
  uploadImage,
  resizeUserPhoto,
  updateUser,
  deleteUser,
  getOneUser,
  getUserFriends,
  addToFriends,
  removeFromFriends,
  getCurrentUserFriends,
} = require("../controller/userController");
const {
  register,
  logOut,
  logIn,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
} = require("../controller/authController");

const postRoute = require("./postRoute");

const router = express.Router();

router
  .route("/friends/:friendId?")
  .get(protect, getCurrentUserFriends)
  .post(protect, addToFriends)
  .delete(protect, removeFromFriends);

router.route("/friends/users/:userId?").get(protect, getUserFriends);

router.route("/register").post(register);
router.route("/login").post(logIn);
router.route("/logout").get(logOut);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);
router.route("/update-password").post(protect, updatePassword);
router
  .route("/")
  .get(protect, getAllUsers)
  .patch(protect, uploadImage, resizeUserPhoto, updateUser)
  .delete(protect, deleteUser);
router.route("/:id").get(protect, getOneUser);

module.exports = router;
