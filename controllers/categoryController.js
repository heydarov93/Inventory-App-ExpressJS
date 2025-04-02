const asyncHandler = require("express-async-handler");
const db = require("../db/queries");
const CustomNotFoundError = require("../error/CustomNotFoundError");
const { body, validationResult } = require("express-validator");

const postFormValidation = [
  body("category_name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required.")
    .isLength({ min: 3 })
    .withMessage("Category name must have minimum 3 characters."),
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

// Get all items of a category and render them
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

// Display form to inserr/update a category
const displayForm = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const options = {
    isItemForm: false,
    category: null,
    title: "Add new category",
    heading_1: "Add new category",
  };

  // If category id exists display update form with category data
  if (categoryId) {
    const category = await db.getCategoryById(categoryId);

    // If category is falsy value or if it is an empty array throw not found error
    if (!category || !category.length)
      throw new CustomNotFoundError("Category not found.");

    options.title = "Update category #" + categoryId;
    options.heading_1 = "Update category #" + categoryId;
    options.category = category[0];
  }

  res.render("form", options);
});

// Insert a new category
const insertCategory = [
  postFormValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    // If there is any error
    if (!errors.isEmpty()) {
      const options = {
        isItemForm: false,
        category: null,
        title: "Add new category",
        heading_1: "Add new category",
        errors: errors.errors,
      };

      // Render same form with errors and related options
      res.status(400).render("form", options);
      return;
    }

    const { category_name, confirm_secret_key: secret_key } = req.body;

    await db.insertCategory({ category_name, secret_key });

    res.redirect("/");
  }),
];

// Update a category
const updateCategory = [
  putFormValidation,
  asyncHandler(async (req, res) => {
    const { category_id, category_name, secret_key, confirm_secret_key } =
      req.body;

    const errors = validationResult(req);

    // If there is any error
    if (!errors.isEmpty()) {
      const options = {
        isItemForm: false,
        category: {
          category_id,
          category_name,
          secret_key,
          confirm_secret_key,
        },
        title: "Update category #" + category_id,
        heading_1: "Update category #" + category_id,
        errors: errors.errors,
      };

      // Render same form with errors and related options
      res.status(400).render("form", options);
      return;
    }

    await db.updateCategory({
      category_id,
      category_name,
      secret_key: secret_key || confirm_secret_key, // if user doesn't change secret key so it should stay same as previous one
      confirm_secret_key,
    });

    res.redirect(`/categories/${category_id}/edit`);
  }),
];

module.exports = {
  getItemsByCategory,
  displayForm,
  insertCategory,
  updateCategory,
};
