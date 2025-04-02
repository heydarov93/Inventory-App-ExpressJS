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

// Insert an item
async function insertItem(itemData) {
  const {
    item_name,
    item_category,
    username,
    contact,
    status,
    details,
    confirm_secret_key,
  } = itemData;

  await pool.query(
    `WITH inserted_item AS (
      INSERT INTO items (
        item_name,
        username,
        contact,
        status,
        details,
        secret_key
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING item_id
    )
    INSERT INTO item_categories (item_id, category_id)
    SELECT inserted_item.item_id, UNNEST($7::int[])
    FROM inserted_item`,
    [
      item_name,
      username,
      contact,
      status,
      details,
      confirm_secret_key,
      item_category,
    ]
  );
}

// Update an item
async function updateItem(itemData) {
  const {
    item_id,
    item_name,
    item_category,
    username,
    contact,
    status,
    details,
    secret_key,
    confirm_secret_key,
  } = itemData;

  await pool.query(
    `WITH updated_item AS (
      UPDATE items SET
        item_name = $1,
        username = $2,
        contact = $3,
        status = $4,
        details = $5,
        secret_key = $6
      WHERE item_id = $7 AND secret_key = $8
      RETURNING item_id
    ),
    deleted_categories AS (
      DELETE FROM item_categories
      WHERE item_id = $7
      AND category_id NOT IN (SELECT UNNEST($9::int[]))
      )
    INSERT INTO item_categories (item_id, category_id)
    SELECT updated_item.item_id, UNNEST($9::int[])
    FROM updated_item
    ON CONFLICT (item_id, category_id) DO NOTHING`,
    [
      item_name,
      username,
      contact,
      status,
      details,
      secret_key || confirm_secret_key, // if user doesn't change secret key so it should stay same as previous one
      item_id,
      confirm_secret_key,
      item_category,
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
  insertItem,
  updateItem,
};
