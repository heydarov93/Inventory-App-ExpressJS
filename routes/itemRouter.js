const { Router } = require("express");
const itemController = require("../controllers/itemController");

const router = Router();

// Show all items
router.get("/", (req, res) => res.redirect("/"));

// Display form to add a new item
router.get("/new", (req, res) => res.send("Add a New Item Form"));

// Display item details
router.get("/:itemId", itemController.getItemById);

// Display form to update an item
router.get("/:itemId/new", (req, res) => res.send("Form to Update an item"));

// Create a new item
router.post("/new", (req, res) => res.send("New item created: 201"));

// Update an item
router.put("/:itemId", (req, res) =>
  res.send("Item Updated: " + req.params.itemId)
);

// Delete an item
router.delete("/:itemId", (req, res) =>
  res.send("Item Deleted: " + req.params.itemId)
);

module.exports = router;
