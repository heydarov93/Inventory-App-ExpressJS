const pool = require("./pool");
require("dotenv").config();

const ADMIN_KEY = process.env.ADMIN_KEY;

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
    `SELECT item_id, item_name, username, details, contact, added, status, secret_key
        FROM items 
    WHERE item_id = $1`,
    [itemId]
  );

  const categories = await getCategoriesByItem(itemId);

  if (rows.length > 0) rows[0].categories = categories;

  return rows;
}

// Insert a category
async function insertCategory(categoryData) {
  const { category_name, secret_key } = categoryData;

  const result = await pool.query(
    "INSERT INTO categories (category_name, secret_key) VALUES ($1, $2)",
    [category_name, secret_key]
  );

  return result.rowCount;
}

// Update a category
async function updateCategory(categoryData) {
  const { category_id, category_name, secret_key, confirm_secret_key } =
    categoryData;
  const setClauses = [];

  const params = [category_name, category_id];

  // User modifies secret key (enters a new one)
  if (secret_key && secret_key.trim !== "") {
    setClauses.push(", secret_key = $3");
    params.push(secret_key);
  }

  // Admin override (bypass secret key check)
  let sql = `UPDATE categories SET category_name = $1${setClauses.join(
    ", "
  )} WHERE category_id = $2`;

  // Regular user update (requires correct confirm_secret_key)
  if (confirm_secret_key !== ADMIN_KEY) {
    params.push(confirm_secret_key);

    sql = `UPDATE categories SET category_name = $1${setClauses.join(
      ", "
    )} WHERE category_id = $2 AND secret_key = $${params.length}`; // Params length is the position of confirm_secret_key
  }

  // Query database
  const result = await pool.query(sql, params);

  return result.rowCount;
}

// Insert an item
async function insertItem(itemData) {
  const {
    item_name,
    categories,
    username,
    contact,
    status,
    details,
    confirm_secret_key,
  } = itemData;

  const result = await pool.query(
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
      categories,
    ]
  );

  return result.rowCount;
}

// Update an item
async function updateItem(itemData) {
  const {
    item_id,
    item_name,
    categories,
    username,
    contact,
    status,
    details,
    secret_key,
    confirm_secret_key,
  } = itemData;

  const setClauses = [];

  const params = [
    item_name,
    username,
    contact,
    status,
    details,
    item_id,
    categories,
  ];

  // User modifies secret key (enters a new one)
  if (secret_key && secret_key.trim !== "") {
    params.push(secret_key);
    setClauses.push(`, secret_key = $${params.length}`);
  }

  // Admin override (bypass secret key check)
  let updateItemSql = `UPDATE items SET
        item_name = $1,
        username = $2,
        contact = $3,
        status = $4,
        details = $5
        ${setClauses.join(", ")}
      WHERE item_id = $6
      RETURNING item_id`;

  // Regular user update (requires correct confirm_secret_key)
  if (confirm_secret_key !== ADMIN_KEY) {
    params.push(confirm_secret_key);

    updateItemSql = `UPDATE items SET
        item_name = $1,
        username = $2,
        contact = $3,
        status = $4,
        details = $5
        ${setClauses.join(", ")}
      WHERE item_id = $6 AND secret_key = $${params.length}
      RETURNING item_id`; // Params length is the position of confirm_secret_key
  }

  const result = await pool.query(
    `WITH updated_item AS (${updateItemSql}),
    deleted_categories AS (
      DELETE FROM item_categories
      WHERE item_id = $6
      AND category_id NOT IN (SELECT UNNEST($7::int[]))
      RETURNING 1
      ),
    inserted_categories AS (INSERT INTO item_categories (item_id, category_id)
    SELECT updated_item.item_id, UNNEST($7::int[])
    FROM updated_item
    ON CONFLICT (item_id, category_id) DO NOTHING
    RETURNING 1
    )
    SELECT 
     (SELECT COUNT(*) FROM updated_item) AS item_updated,
     (SELECT COUNT(*) FROM deleted_categories) AS categories_deleted,
     (SELECT COUNT(*) FROM inserted_categories) AS categories_added`,
    params
  );
  const { item_updated, categories_deleted, categories_added } = result.rows[0];

  return +item_updated + +categories_deleted + +categories_added;
}

async function categoryHasItems(categoryId) {
  return await pool.query(
    "SELECT EXISTS(SELECT 1 FROM item_categories WHERE category_id = $1)",
    [categoryId]
  );
}

async function deleteCategory(categoryId, secret_key) {
  // Regular user update (requires correct confirm_secret_key)
  if (secret_key !== ADMIN_KEY) {
    return (
      await pool.query(
        "DELETE FROM categories WHERE category_id = $1 AND secret_key = $2",
        [categoryId, secret_key]
      )
    ).rowCount;
  }

  // Admin updates (bypass secret key check)
  return (
    await pool.query("DELETE FROM categories WHERE category_id = $1", [
      categoryId,
    ])
  ).rowCount;
}

async function deleteItem(itemId, secret_key) {
  // Regular user update (requires correct confirm_secret_key)
  if (secret_key !== ADMIN_KEY) {
    return (
      await pool.query(
        "DELETE FROM items WHERE item_id = $1 AND secret_key = $2",
        [itemId, secret_key]
      )
    ).rowCount;
  }

  // Admin updates (bypass secret key check)
  return (await pool.query("DELETE FROM items WHERE item_id = $1", [itemId]))
    .rowCount;
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
  deleteCategory,
  deleteItem,
  categoryHasItems,
};
