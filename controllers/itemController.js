const asyncHandler = require("express-async-handler");
const db = require("../db/queries");
const CustomNotFoundError = require("../error/CustomNotFoundError");

const getItemById = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const item = await db.getItemById(itemId);

  // If item is a falsy value or if it is an empty array throw not found error
  if (!item || !item.length) throw new CustomNotFoundError("Item not found!");

  // First element of the item array is an item data
  res.render("item-details", {
    title: item[0].item_name,
    heading_1: item[0].item_name,
    item: item[0],
  });
});

const displayForm = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const options = {
    isItemForm: true,
    item: null,
    title: "Add new item",
    heading_1: "Add new item",
  };

  if (itemId) {
    options.title = "Update category " + itemId;
    options.heading_1 = "Update category " + itemId;
    options.item = { item_id: itemId };
  }

  res.render("form", options);
});

module.exports = { getItemById, displayForm };
