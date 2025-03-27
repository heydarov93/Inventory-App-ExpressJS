const asyncHandler = require("express-async-handler");
const db = require("../db/queries");
const CustomNotFoundError = require("../error/CustomNotFoundError");

const getItemsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const items = await db.getItemsByCategory(categoryId);

  // If items is falsy value or if it is an empty array throw not found error
  if (!items || !items.length)
    throw new CustomNotFoundError("No items found for this category.");

  res.render("items", {
    title: items[0].category_name,
    heading_1: `All items for ${items[0].category_name} category`,
    items,
  });
});

const displayForm = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const options = {
    isItemForm: false,
    category: null,
    title: "Add new category",
    heading_1: "Add new category",
  };

  if (categoryId) {
    options.title = "Update category " + categoryId;
    options.heading_1 = "Update category " + categoryId;
    options.category = { category_id: categoryId };
  }

  res.render("form", options);
});

module.exports = {
  getItemsByCategory,
  displayForm,
};
