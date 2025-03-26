const { Client } = require("pg");
require("dotenv").config();

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_NAME = process.env.DB_NAME;
const DB_PASSW = process.env.DB_PASSW;
const DB_PORT = process.env.DB_PORT;
const ADMIN_KEY = process.env.ADMIN_KEY;

const SQL = `
CREATE TABLE IF NOT EXISTS categories (
    category_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    category_name VARCHAR(255) NOT NULL,
    secret_key VARCHAR(255) NOT NULL
);


CREATE TABLE IF NOT EXISTS items (
    item_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    item_name VARCHAR(255) NOT NULL,
    username VARCHAR(155) NOT NULL,
    details TEXT,
    contact VARCHAR(20) NOT NULL,
    added TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status INTEGER NOT NULL CHECK(status IN (0, 1)),
    secret_key VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS item_categories (
    item_id INTEGER,
    category_id INTEGER,
    CONSTRAINT fk_item
        FOREIGN KEY(item_id)
            REFERENCES items(item_id) ON DELETE CASCADE,
    CONSTRAINT fk_category
        FOREIGN KEY(category_id)
            REFERENCES categories(category_id) ON DELETE CASCADE,
    PRIMARY KEY (item_id, category_id)
);


INSERT INTO categories(category_name, secret_key)
VALUES
    ('Laptop', '${ADMIN_KEY}'),
    ('Money', '${ADMIN_KEY}'),
    ('Gold', '${ADMIN_KEY}');

INSERT INTO items(item_name, username, details, contact, status, secret_key )
VALUES
    ('Ring', 'baklick', 'I found this item at the bus station.', '+12834567890', 1, '${ADMIN_KEY}'),
    ('Dell laptop', 'baklick', 'I lost my laptop at the cafe.', '+12834567890', 0, '${ADMIN_KEY}'),
    ('100 USD', 'baklick', 'I found $100 at the school.', '+12834567890', 1, '${ADMIN_KEY}');

INSERT INTO item_categories(item_id, category_id)
VALUES
    (1, 3),
    (2, 1),
    (3, 1);
`;

async function main() {
  console.log("Starting to populate the database...");

  const client = new Client({
    host: DB_HOST,
    user: DB_USER,
    database: DB_NAME,
    password: DB_PASSW,
    port: DB_PORT,
  });

  await client.connect();
  await client.query(SQL);
  await client.end();

  console.log("Done");
}

main();
