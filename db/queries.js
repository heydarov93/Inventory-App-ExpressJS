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

// Get category by id from db
async function getCategoryById(categoryId) {
  const { rows } = await pool.query(
    "SELECT * FROM categories WHERE category_id = $1",
    [categoryId]
  );
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

// Get categories by item from db
async function getCategoriesByItem(itemId) {
  const { rows } = await pool.query(
    `SELECT c.category_id, c.category_name
        FROM categories c
        JOIN item_categories
            ON item_categories.category_id = c.category_id
        JOIN items
            ON items.item_id = item_categories.item_id
    WHERE items.item_id = $1`,
    [itemId]
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

  const categories = await getCategoriesByItem(itemId);
  rows[0].categories = categories;

  return rows;
}

// Insert a category
async function insertCategory(categoryData) {
  const { category_name, secret_key } = categoryData;

  await pool.query(
    "INSERT INTO categories (category_name, secret_key) VALUES ($1, $2)",
    [category_name, secret_key]
  );
}
// Update a category
async function updateCategory(categoryData) {
  const { category_id, category_name, secret_key, confirm_secret_key } =
    categoryData;

  await pool.query(
    "UPDATE categories SET category_name = $1, secret_key = $2 WHERE category_id = $3 AND secret_key = $4",
    [
      category_name,
      secret_key || confirm_secret_key, // if user doesn't change secret key so it should stay same as previous one
      category_id,
      confirm_secret_key,
    ]
  );
}

module.exports = {
  getItems,
  getCategories,
  getItemsByCategory,
  getItemById,
  getCategoryById,
  getCategoriesByItem,
  insertCategory,
  updateCategory,
};
