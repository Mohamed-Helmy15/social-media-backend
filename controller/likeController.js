const Like = require("../model/likesModel");
const Post = require("../model/postModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.giveLike = catchAsync(async (req, res, next) => {
  const post = req.params.postId;
  const user = req.user.id;
  const doc = await Like.create({ post, user });
  const likedPost = await Post.findOne({ _id: post });
  likedPost.likes.push(doc._id);
  await likedPost.save({ validateBeforeSave: false });
  res.status(201).json({
    status: "success",
  });
});

exports.removeLike = catchAsync(async (req, res, next) => {
  const post = req.params.postId;
  const user = req.user.id;
  const likeDoc = await Like.findOne({ post, user });
  if (!likeDoc)
    return next(new AppError("you are not already like this post", 500));
  const postDoc = await Post.findOne({ _id: post });
  const likedPost = postDoc.likes.filter((id) => likeDoc.id != id);
  postDoc.likes = likedPost;
  await postDoc.save({ validateBeforeSave: false });
  await Like.findOneAndRemove({ post, user });

  res.status(204).json({});
});
