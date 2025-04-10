const asyncHandler = require("express-async-handler");
const db = require("../db/queries");
const CustomNotFoundError = require("../error/CustomNotFoundError");
const { body, validationResult, param } = require("express-validator");
const { formatDate } = require("../utils/formatDate");

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

const paramsValidation = [
  param("categoryId")
    .custom(async (id, { req }) => {
      const category = await db.getCategoryById(id);

      if (!category || category.length === 0) throw new Error();

      if (
        req.originalUrl.match(/^\/categories\/[^/]+\/(edit|delete)$/) &&
        req.method === "GET"
      )
        req.category = category;

      return true;
    })
    .withMessage("Category not found."),
];

const deleteCategoryValidation = [
  param("categoryId")
    .custom(async (id, { req }) => {
      const category = await db.getCategoryById(id);

      if (!category || category.length === 0) throw new Error();

      req.category = category;

      return true;
    })
    .withMessage("Category not found."),
  body("secret_key")
    .custom(async (secret_key, { req }) => {
      if (req.category[0].secret_key !== secret_key) throw new Error();

      return true;
    })
    .withMessage("Invalid secret key."),
];

// Get all items of a category and render them
const getItemsByCategory = [
  paramsValidation,
  asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const errors = validationResult(req);

    // Throw error if category not found for a given id
    if (!errors.isEmpty()) throw new CustomNotFoundError(errors.errors[0].msg);

    // If category id is valid and category exists then query db for relative items
    const items = await db.getItemsByCategory(categoryId);

    // If items is falsy value or if it is an empty array throw not found error
    if (!items || !items.length)
      throw new CustomNotFoundError("No items found for this category.");

    res.render("items", {
      title: items[0].category_name,
      heading_1: `All items for ${items[0].category_name} category`,
      items,
      formatDate,
    });
  }),
];

// Display form to insert/update a category
const displayForm = [
  paramsValidation,
  asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const options = {
      isItemForm: false,
      category: null,
      title: "Add new category",
      heading_1: "Add new category",
    };

    // If category id exists display update form with category data
    if (categoryId) {
      const errors = validationResult(req);

      // Throw error if category not found for a given id
      if (!errors.isEmpty())
        throw new CustomNotFoundError(errors.errors[0].msg);

      options.title = "Update category #" + categoryId;
      options.heading_1 = "Update category #" + categoryId;
      options.category = req.category[0];
    }

    res.render("form", options);
  }),
];

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

const displayDeleteForm = [
  paramsValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new CustomNotFoundError(errors.errors[0].msg);
    }

    res.render("delete-form", { category: req.category[0] });
  }),
];

const deleteCategory = [
  deleteCategoryValidation,
  asyncHandler(async (req, res) => {
    const { categoryId } = req.params;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // render form with error message (400 bad request)
      res.status(403).render("delete-form", {
        category: req.category[0],
        errors: errors.errors,
      });
      return;
    }

    const { rows } = await db.categoryHasItems(categoryId);
    const hasItems = rows[0].exists;

    // If category has items don't allow to delete it
    if (hasItems) {
      return res.status(409).render("error", {
        message: "Category has associated items. Remove them first.",
        statusCode: 409,
      });
    }

    await db.deleteCategory(categoryId, req.category[0].secret_key);
    res.redirect("/");
  }),
];

module.exports = {
  getItemsByCategory,
  displayForm,
  insertCategory,
  updateCategory,
  displayDeleteForm,
  deleteCategory,
};
