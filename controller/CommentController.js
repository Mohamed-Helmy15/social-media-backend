const Comment = require("../model/commentModel");
const Post = require("../model/postModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.addComment = catchAsync(async (req, res, next) => {
  const post = req.params.postId;
  const user = req.user.id;
  const comment = req.body.comment;
  const doc = await Comment.create({ comment, post, user });
  const commentedPost = await Post.findOne({ _id: post });
  commentedPost.comments.push(doc._id);
  await commentedPost.save({ validateBeforeSave: false });
  res.status(201).json({
    status: "success",
  });
});

exports.removeComment = catchAsync(async (req, res, next) => {
  const user = req.user.id;
  const post = req.params.postId;
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);

  if (!comment.user === user)
    return next(new AppError("you can not delet other people comments", 401));

  const postDoc = await Post.findOne({ _id: post });
  const commentedPost = postDoc.comments.filter((id) => commentId != id);
  postDoc.comments = commentedPost;
  await postDoc.save({ validateBeforeSave: false });

  await Comment.findByIdAndRemove(comment);
  res.status(204).json({});
});
