const asyncHandler = require("express-async-handler");
const { getCategories } = require("../db/queries");

const showHomePage = asyncHandler(async (req, res) => {
  const categories = await getCategories();

  res.render("index", {
    title: "Home | WhereIsIt",
    heading_1: "All categories",
    categories,
  });
});

module.exports = {
  showHomePage,
};
