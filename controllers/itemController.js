const asyncHandler = require("express-async-handler");
const db = require("../db/queries");
const CustomNotFoundError = require("../error/CustomNotFoundError");
const { body, validationResult, param } = require("express-validator");
const { formatDate } = require("../utils/formatDate");

const requiredMsg = "is required.";

const postFormValidation = [
  body("item_name")
    .trim()
    .notEmpty()
    .withMessage(`Item name ${requiredMsg}`)
    .isLength({ min: 5, max: 30 })
    .withMessage("Item name must be between 5 and 30 characters."),
  body("categories")
    .isArray({ min: 1 })
    .withMessage(`You must choose at least 1 category.`),
  body("categories.*")
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
    .withMessage("Details must be a maximum of 2000 characters."),
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

// Validate item id
const paramsValidation = [
  param("itemId")
    .custom(async (id, { req }) => {
      const item = await db.getItemById(id);

      if (!item || item.length === 0) throw new Error();

      // Pass item to controller via rqeuest object
      req.item = item;

      return true;
    })
    .withMessage("Item not found."),
];

// const deleteItemValidation = [
//   ...paramsValidation,
//   body("secret_key")
//     .custom(async (secret_key, { req }) => {
//       if (req.item[0].secret_key !== secret_key) throw new Error();

//       return true;
//     })
//     .withMessage("Invalid secret key."),
// ];

const getItemById = [
  paramsValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    // If item id validation fails (there is no item for given id) throw not found error
    if (!errors.isEmpty()) throw new CustomNotFoundError("Item not found!");

    const { item } = req;

    item[0].added = formatDate(item[0].added);

    // First element of the item array is an item data
    res.render("item-details", {
      title: item[0].item_name,
      heading_1: item[0].item_name,
      item: item[0],
    });
  }),
];

const displayForm = [
  paramsValidation,
  asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const options = {
      isItemForm: true,
      item: null,
      title: "Add new item",
      heading_1: "Add new item",
      categories: await db.getCategories(),
    };

    if (itemId) {
      const errors = validationResult(req);

      // Throw error if item not found for a given id
      if (!errors.isEmpty())
        throw new CustomNotFoundError(errors.errors[0].msg);

      // Multiselect input recieves only category ids to check selected categories
      req.item[0].categories = req.item[0].categories.map(
        (category) => category.category_id
      );
      options.title = "Update item #" + itemId;
      options.heading_1 = "Update item #" + itemId;
      options.item = req.item[0];
    }

    res.render("form", options);
  }),
];

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

    const rowCount = await db.insertItem(req.body);

    if (rowCount < 1) {
      res.redirect("/items/new?status=fail");
      return;
    }

    res.redirect("/?status=success");
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

    const rowCount = await db.updateItem(req.body);

    if (rowCount < 1) {
      res.redirect("/items/" + item_id + "/edit?status=fail");
      return;
    }

    res.redirect("/items/" + item_id + "?status=success");
  }),
];

const displayDeleteForm = [
  paramsValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new CustomNotFoundError(errors.errors[0].msg);
    }

    res.render("delete-form", { item: req.item[0] });
  }),
];

const deleteItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const rowCount = await db.deleteItem(itemId, req.body.secret_key);

  if (rowCount < 1) {
    res.redirect(`/items/${itemId}/delete?status=fail`);
    return;
  }

  res.redirect("/?status=success");
});

module.exports = {
  getItemById,
  displayForm,
  insertItem,
  updateItem,
  displayDeleteForm,
  deleteItem,
};
