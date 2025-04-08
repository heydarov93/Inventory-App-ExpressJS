const { Router } = require("express");
const categoryController = require("../controllers/categoryController");

const router = Router();

// Show all categories
router.get("/", (req, res) => res.redirect("/"));

// Display form to add a new category
router.get("/new", categoryController.displayForm);

// Display all items under a related category
router.get("/:categoryId", categoryController.getItemsByCategory);

// Display form to update a category
router.get("/:categoryId/edit", categoryController.displayForm);

// Display form to delete a category
router.get("/:categoryId/delete", categoryController.displayDeleteForm);

// Create a new category
router.post("/new", categoryController.insertCategory);

// Update a category
router.post("/:categoryId/update", categoryController.updateCategory);

// Delete a category
router.post("/:categoryId/delete", categoryController.deleteCategory);

module.exports = router;
