const express = require("express");
const methodOverride = require("method-override");
const path = require("node:path");
const indexRouter = require("./routes/indexRouter");
const categoryRouter = require("./routes/categoryRouter");
const itemRouter = require("./routes/itemRouter");
const CustomNotFoundError = require("./error/CustomNotFoundError");
require("dotenv").config();

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Folder to retrieve static files from
const assetsPath = path.join(__dirname, "public");

// App level middlewares

// Serve images, CSS files, and JavaScript files in a directory named public
app.use(express.static(assetsPath));

// Enable _method override (must come before routes)
// app.use(methodOverride("_method"));

// Allow express to use form data
app.use(express.urlencoded({ extended: true }));

// Register routers
app.use("/", indexRouter);
app.use("/categories", categoryRouter);
app.use("/items", itemRouter);
app.get("*", () => {
  throw new CustomNotFoundError("Page Not Found!");
});

// Register error middleware
app.use((error, req, res, next) => {
  console.log(error);

  if (!error.statusCode) {
    res
      .status(500)
      .render("error", { statusCode: 500, message: "Internal Server Error" });
    return;
  }

  res
    .status(error.statusCode)
    .render("error", { statusCode: error.statusCode, message: error.message });
});

const PORT = process.env.APP_PORT;
app.listen(PORT, () => {
  console.log("Application runs on port ", PORT);
});
