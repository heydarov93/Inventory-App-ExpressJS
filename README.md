# WhereItIs? - Lost/Found Hub Community

> **WhereItIs?** is a community-driven lost and found platform built with Express.js and PostgreSQL, allowing users to manage categories and items with secure ownership controls.

<br>

🔴 **Live**: [inventory-app-expressjs-production.up.railway.app](https://inventory-app-expressjs-production.up.railway.app/)

> [!WARNING] 
> The live demo may experience downtime as it is hosted on a free service. For guaranteed access, please [run locally](#-installation-and-setup) using the instructions below.

<br>

## 📃 Overview
**WhereItIs?** is a web application for managing lost and found items in a community. Users can create, update, and delete categories (e.g., electronics, clothing) and items (e.g., lost phone, found wallet) using forms. Each category and item has a secret key, so only the owner can change or remove it. An admin can manage everything with a special admin key. This project was developed following the instructions from The Odin Project. [Link to instructions](https://www.theodinproject.com/lessons/node-path-nodejs-inventory-application)

<br>

## 🌟 Features
- **User Actions**:
  - Create, update, and delete categories and items.
  - Secret key needed to edit or delete your own categories and items.
- **Admin Rights**:
  - Admin can edit or delete any category or item using the admin key.
- **Navigation**:
  - Homepage shows all categories.
  - Click a category to see its items.
  - Click an item to see its details.
  - Header links: Home, Add Category, Add Item.
- **Security**:
  - Secret keys protect user content.
  - Admin key controls the whole platform.

<br>

## 🥞 Tech Stack
| Category      | Tools |
| ----------- | ----------- |
| Backend      | Node.js, Express.js       |
| Database   | PostgreSQL        |
| Views   | EJS        |
| Frontend   | HTML, Bootstrap 5.3.5        |
| Validation   | express-validator        |
| Database Client   | pg        |
| Async Handling   | express-async-handler        |
| For environment variables   | dotenv  |

 <br>
	
## 📥 Installation and Setup
**Prerequisites**
- Node.js (installed on your computer)
- PostgreSQL (database set up)

**Steps**
1. Clone the project:
```
git clone https://github.com/heydarov93/Inventory-App-ExpressJS.git
```

2. Go to the project folder:
```
cd Inventory-App-ExpressJS
```

3. Install the tools:
 ```
npm install
```

4. Create a .env file with these details:
```
APP_PORT=3000
DB_HOST=localhost
DB_USER=your_db_user
DB_NAME=your_db_name
DB_PASSW=your_db_password
DB_PORT=5432
ADMIN_KEY=your_admin_secret_key
```

5. (Optional) Add sample data:
```
npm run populatedb
```

6. Start the app:
```
npm start
```

<br>

## ▶ Usage
- **Open the App**:
  - Go to http://localhost:3000 in your browser.
- **Navigation**:
  - **Home**: See all categories.
  - **Add Category**: Make a new category.
  - **Add Item**: Add an item to a category.
- **Manage Content**:
  - Use the secret key to edit or delete your categories and items.
  - Admin uses the admin key to manage everything.

<br>

## 🧭 Routes
**Categories**
- <mark>GET /categories/new</mark>: Show form to add a category.
- <mark>GET /categories/:categoryId</mark>: See items in a category.
- <mark>GET /categories/:categoryId/edit</mark>: Show form to edit a category.
- <mark>GET /categories/:categoryId/delete</mark>: Show form to delete a category.
- <mark>POST /categories/new</mark>: Add a new category.
- <mark>POST /categories/:categoryId/update</mark>: Save changes to a category.
- <mark>POST /categories/:categoryId/delete</mark>: Remove a category.

<br>

**Items**
- <mark>GET /items/new</mark>: Show form to add an item.
- <mark>GET /items/:itemId</mark>: See item details.
- <mark>GET /items/:itemId/edit</mark>: Show form to edit an item.
- <mark>GET /items/:itemId/delete</mark>: Show form to delete an item.
- <mark>POST /items/new</mark>: Add a new item.
- <mark>POST /items/:itemId/update</mark>: Save changes to an item.
- <mark>POST /items/:itemId/delete</mark>: Remove an item.

<br>

## 🔐 Security Tips
- **Secret Keys**:
  - Every category and item has its own key.
  - You need the right key to edit or delete.
- **Admin Key**:
  - Admin can control all content with the admin key.
- **Safety**:
  - Keep the admin key secret.
  - Use the <mark>.env</mark> file for sensitive details.

<br>

## 🤝 Contributing
- **How to Help**:
  - Copy the project (fork it).
  - Make a new branch for your changes.
  - Send a pull request with your updates.
- **Code Rules**:
  - Match the current style.
  - Test your changes.

<br>

## ⚖ License
This project is open-source and available under the [MIT License](LICENSE).

<br>

## Authors
Yashar Heydarov - [Github](https://github.com/heydarov93) / [Linkedin](https://www.linkedin.com/in/yashar-heydarov/)
