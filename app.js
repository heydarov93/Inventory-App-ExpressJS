const express = require("express");
const path = require("node:path");
const indexRouter = require("./routes/indexRouter");
const categoryRouter = require("./routes/categoryRouter");
const itemRouter = require("./routes/itemRouter");
require("dotenv").config();

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/", indexRouter);
app.use("/categories", categoryRouter);
app.use("/items", itemRouter);

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
