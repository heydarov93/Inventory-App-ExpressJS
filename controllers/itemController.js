const asyncHandler = require("express-async-handler");
const db = require("../db/queries");
const CustomNotFoundError = require("../error/CustomNotFoundError");
const { body, validationResult } = require("express-validator");

const requiredMsg = "is required.";

const postFormValidation = [
  body("item_name")
    .trim()
    .notEmpty()
    .withMessage(`Item name ${requiredMsg}`)
    .isLength({ min: 5, max: 30 })
    .withMessage("Item name must be between 5 and 30 characters."),
  body("item_category")
    .isArray({ min: 1 })
    .withMessage(`You must choose at least 1 category.`),
  body("item_category.*")
    .trim()
    .isInt()
    .withMessage("Category names are invalid."),
  body("username")
    .trim()
    .notEmpty()
    .withMessage(`Username ${requiredMsg}`)
    .matches(/^[a-zA-Z0-9._]+$/)
    .withMessage(
      "Username can only contain letters, numbers, dots, and underscores"
    )
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters."),
  body("contact")
    .trim()
    .notEmpty()
    .withMessage(`Phone number ${requiredMsg}`)
    .customSanitizer((phone) => phone.replace(/[^\d+]/g, ""))
    .isMobilePhone("any", { strictMode: true }) // Use strictMode: true to require + for international numbers.
    .withMessage("Invalid phone number"),
  body("status")
    .trim()
    .notEmpty()
    .withMessage(`Status ${requiredMsg}`)
    .isInt()
    .isIn([0, 1])
    .withMessage("Invalid value for status"),
  body("details")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Details must be a maximum of 2000 characters.")
    .escape(),
  body("confirm_secret_key")
    .trim()
    .notEmpty()
    .withMessage("Confirmation of secret key is required.")
    .isLength({ min: 5 })
    .withMessage("Secret key must have minimum 5 characters."),
];

const putFormValidation = [
  ...postFormValidation,
  body("secret_key")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 5 })
    .withMessage("Secret key must have minimum 5 characters."),
];

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
    categories: await db.getCategories(),
  };

  if (itemId) {
    const item = await db.getItemById(itemId);

    // If item is falsy value or if it is an empty array throw not found error
    if (!item || !item.length) throw new CustomNotFoundError("Item not found.");

    options.title = "Update item #" + itemId;
    options.heading_1 = "Update item #" + itemId;
    options.item = item[0];
  }

  res.render("form", options);
});

// Insert a new item
const insertItem = [
  postFormValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    // If there is any error
    if (!errors.isEmpty()) {
      const options = {
        isItemForm: true,
        item: null,
        title: "Add new item",
        heading_1: "Add new item",
        categories: await db.getCategories(),
        errors: errors.errors,
      };

      // Render same form with errors and related options
      res.status(400).render("form", options);
      return;
    }

    await db.insertItem(req.body);

    res.redirect("/");
  }),
];

// Update an item
const updateItem = [
  putFormValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const { item_id } = req.body;

    // If there is any error
    if (!errors.isEmpty()) {
      console.log(errors.errors);
      const options = {
        isItemForm: true,
        item: req.body,
        title: "Update item #" + item_id,
        heading_1: "Update item #" + item_id,
        categories: await db.getCategories(),
        errors: errors.errors,
      };

      // Render same form with errors and related options
      res.status(400).render("form", options);
      return;
    }

    // If secret key is empty (not edited) keep it same as previous
    req.body.secret_key = req.body.secret_key || req.bodyconfirm_secret_key;

    await db.updateItem(req.body);

    res.redirect("/items/" + item_id);
  }),
];

module.exports = { getItemById, displayForm, insertItem, updateItem };
