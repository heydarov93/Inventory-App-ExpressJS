const { Router } = require("express");

const router = Router();

// Show all categories
router.get("/", (req, res) => res.redirect("/"));

// Display form to add a new category
router.get("/new", (req, res) => res.send("Add a New Category Form"));

// Display all items under a related category
router.get("/:categoryId", (req, res) =>
  res.send("All items under Category id: " + req.params.categoryId)
);

// Display form to update a category
router.get("/:categoryId/new", (req, res) =>
  res.send("Form to Update an category")
);

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
