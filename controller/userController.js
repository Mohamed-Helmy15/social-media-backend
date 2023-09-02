const User = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const multer = require("multer");
const sharp = require("sharp");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    length: users.length,
    data: {
      users,
    },
  });
});

exports.getOneUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) return next(new AppError("there is no user with this id", 404));
  res.status(200).json({
    status: "success",
    data: {
      userFriends: user.friends.length,
      user,
    },
  });
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("only image allowed", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadImage = upload.single("picturePath");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({
      quality: 90,
    })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  if (req.file) {
    req.body.picturePath = req.file.filename;
  }
  const newUser = await User.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
    runValidators: false,
  });
  if (!newUser) return next(new AppError("there is no user with this id", 404));

  res.status(200).json({
    status: "success",
    data: {
      newUser,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const user = await User.findOneAndRemove({ _id: id });
  if (!user) return next(new AppError("there is no user with this id", 404));
  res.status(204).json({
    status: "success",
  });
});

exports.getCurrentUserFriends = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const user = await User.findById(id);
  const friends = await Promise.all(
    user.friends.map((friend) => User.findById(friend))
  );
  if (!friends) return next(new AppError("there some thing error", 404));
  res.status(200).json({
    status: "success",
    data: {
      friends,
    },
  });
});

exports.getUserFriends = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  const friends = await Promise.all(
    user.friends.map((friend) => User.findById(friend))
  );
  if (!friends) return next(new AppError("there some thing error", 404));
  res.status(200).json({
    status: "success",
    data: {
      friends,
    },
  });
});

exports.addToFriends = catchAsync(async (req, res, next) => {
  const { newFriend } = req.body;
  if (!newFriend)
    return next(new AppError("please add the correct field name", 500));
  const { id } = req.user;
  const user = await User.findById(id);
  if (user.friends.includes(newFriend))
    return next(new AppError("already a friend", 500));

  user.friends.push(newFriend);
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
  });
});
exports.removeFromFriends = catchAsync(async (req, res, next) => {
  const friend = req.params.friendId;
  if (!friend)
    return next(new AppError("please add the correct field name", 500));
  const { id } = req.user;
  const user = await User.findById(id);
  const newFriends = user.friends.filter((id) => id !== friend);
  user.friends = newFriends;
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
  });
});
