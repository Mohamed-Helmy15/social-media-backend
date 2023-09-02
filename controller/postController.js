const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const multer = require("multer");
const sharp = require("sharp");
const Post = require("../model/postModel");

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find();
  res.status(200).json({
    status: "success",
    data: {
      posts,
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
exports.uploadImage = upload.single("photo");

exports.resizePostPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `post-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({
      quality: 90,
    })
    .toFile(`public/img/posts/${req.file.filename}`);
  next();
});

exports.createPost = catchAsync(async (req, res, next) => {
  const user = req.user.id;
  const { description } = req.body;
  if (req.file) {
    req.body.photo = req.file.filename;
  }
  const post = await Post.create({
    description,
    photo: req.body.photo,
    user,
  });

  res.status(200).json({
    status: "success",
    data: {
      post,
    },
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const post = await Post.findOneAndRemove({ _id: postId });
  if (!post) return next(new AppError("there is no post with this id", 500));
  res.status(204).json({});
});

exports.getMyPosts = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const posts = await Post.find({ user: id });
  res.status(200).json({
    status: "success",
    data: {
      posts,
    },
  });
});
exports.getMyFriendsPosts = catchAsync(async (req, res, next) => {
  const friends = req.user.friends;
  const posts = await Post.find({ user: { $in: friends } });

  res.status(200).json({
    status: "success",
    data: {
      posts,
    },
  });
});
exports.getMyFriendPosts = catchAsync(async (req, res, next) => {
  const { friendId } = req.params;
  const posts = await Post.find({ user: { $in: friendId } });

  res.status(200).json({
    status: "success",
    data: {
      posts,
    },
  });
});
