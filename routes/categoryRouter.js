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

// Create a new category
router.post("/new", (req, res) => res.send("New category created: 201"));

// Update an category
router.put("/:categoryId", (req, res) =>
  res.send("Category Updated: " + req.params.categoryId)
);

// Delete an category
router.delete("/:categoryId", (req, res) =>
  res.send("Category Deleted: " + req.params.categoryId)
);

module.exports = router;
