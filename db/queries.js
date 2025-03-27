const pool = require("./pool");

// Retrieve all items from db
async function getItems() {
  const { rows } = await pool.query("SELECT * FROM items");
  return rows;
}

// Retrieve all categories from db
async function getCategories() {
  const { rows } = await pool.query("SELECT * FROM categories");
  return rows;
}

// Get items by their category from db
async function getItemsByCategory(categoryId) {
  const { rows } = await pool.query(
    `SELECT i.item_id, i.item_name, i.username, i.details, i.contact, i.added, i.status, categories.category_name
        FROM items i
        JOIN item_categories
            ON item_categories.item_id = i.item_id
        JOIN categories
            ON categories.category_id = item_categories.category_id
    WHERE categories.category_id = $1`,
    [categoryId]
  );
  return rows;
}

// Get items by their id from db
async function getItemById(itemId) {
  const { rows } = await pool.query(
    `SELECT item_id, item_name, username, details, contact, added, status
        FROM items 
    WHERE item_id = $1`,
    [itemId]
  );
  return rows;
}

module.exports = {
  getItems,
  getCategories,
  getItemsByCategory,
  getItemById,
};
