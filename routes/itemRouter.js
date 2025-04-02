const { Router } = require("express");
const itemController = require("../controllers/itemController");

const router = Router();

// Show all items
router.get("/", (req, res) => res.redirect("/"));

// Display form to add a new item
router.get("/new", itemController.displayForm);

// Display item details
router.get("/:itemId", itemController.getItemById);

// Display form to update an item
router.get("/:itemId/edit", itemController.displayForm);

// Create a new item
router.post("/new", itemController.insertItem);

// Update an item
router.put("/:itemId", itemController.updateItem);

// Delete an item
router.delete("/:itemId", (req, res) =>
  res.send("Item Deleted: " + req.params.itemId)
);

module.exports = router;
