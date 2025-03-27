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

module.exports = { getItemById };
