const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/userRoute");
const postRoute = require("./routes/postRoute");
const likeRoute = require("./routes/likeRoute");
const errorController = require("./controller/errorController");
const AppError = require("./utils/appError");
const { rateLimit } = require("express-rate-limit");
const xss = require("xss-clean");
const ExpressMongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
dotenv.config();
const app = express();
app.use(express.json());



app.use(ExpressMongoSanitize());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(xss());
app.use(compression());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://helmy-social-media.onrender.com",
"https://helmy-social-media.netlify.app",
    ],
  })
);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/posts", postRoute);
app.use("/api/v1/likes", likeRoute);

app.all("*", (req, res, next) => {
  next(new AppError(`can not find ${req.originalUrl} on the server `, 404));
});

app.use(errorController);

const port = process.env.PORT;
const DB = process.env.MONGODB;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(port, () => console.log(`server running on port ${port}`));
  })
  .catch((err) => console.log(err));
