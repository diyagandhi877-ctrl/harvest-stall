# 🌱 Harvest Stall — Multi-Role Fresh Produce Marketplace

Harvest Stall is a full-stack multi-role marketplace for buying and selling fresh fruits and vegetables.

The project was developed as a **Community Engagement Project (CEP)** by a team of four students. It evolved from an original frontend prototype into a working application with a **Node.js + Express + MongoDB backend**, **JWT authentication**, role-based access control, customer shopping, farmer management, and an admin control panel.

The original visual identity has been preserved, including the typography, colors, product cards, pricing tags, and overall marketplace aesthetic.

---

## 🚀 Live Demo

**Frontend:**
https://harvest-stall-frontend.onrender.com

**Backend API:**
https://harvest-stall.onrender.com

The frontend communicates with the deployed production backend through the API layer.

---

## ✨ Key Features

### 🛒 Customer

* Browse fresh fruits and vegetables
* Search, filter, and sort products
* Select product weight — 250g, 500g, or 1kg
* Add products to cart
* Wishlist functionality
* Server-side cart persistence for logged-in users
* Checkout and order placement
* Automatic order splitting by farmer
* Order history
* Address management
* Customer profile
* Contact sellers
* General contact form
* English / Hindi / Marathi language support
* Dark mode

### 👨‍🌾 Farmer

* Farmer registration
* Admin approval workflow
* Farmer dashboard
* Add, edit, publish, and delete products
* Set prices for different weights
* Manage product stock
* Accept and update orders
* Store availability toggle
* Store profile management
* Revenue analytics
* Top-product analytics
* Customer messaging

### 🛡️ Admin

* Admin dashboard
* Platform statistics
* Approve or reject farmers
* Activate / deactivate accounts
* Moderate products
* View platform orders
* Manage categories
* Send announcements

---

## 🔐 Authentication & Security

The backend implements several security mechanisms:

* JWT-based authentication
* Role-based authorization
* bcrypt password hashing
* Protected API routes
* Farmer approval workflow
* Helmet security headers
* CORS allow-list
* MongoDB NoSQL injection protection
* Rate limiting
* Stricter rate limiting for authentication endpoints
* Request validation using `express-validator`

---

## 🏗️ Project Structure

```text
harvest-stall/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── uploads/
│   ├── utils/
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── css/
│   │   ├── styles.css
│   │   └── extend.css
│   │
│   ├── js/
│   │   ├── api.js
│   │   └── i18n.js
│   │
│   ├── index.html
│   ├── farmer-dashboard.html
│   └── admin-dashboard.html
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🛠️ Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Responsive UI
* Client-side filtering and sorting
* Fetch API
* Internationalization — English / Hindi / Marathi

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Multer
* Helmet
* CORS
* express-validator
* Rate limiting
* mongo-sanitize

### Database & Deployment

* MongoDB Atlas
* Render
* GitHub

---

## ⚙️ Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/diyagandhi877-ctrl/harvest-stall.git
cd harvest-stall
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `backend` directory.

Example:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
PORT=5000
```

**Never commit the real `.env` file to GitHub.**

### 4. Seed the database

```bash
npm run seed
```

The seed script creates:

* Demo admin account
* Demo farmer account
* Product categories
* 12 starter products

### 5. Start the backend

```bash
npm run dev
```

The API will run locally at:

```text
http://localhost:5000
```

### 6. Run the frontend

Open:

```text
frontend/index.html
```

directly in a browser, or serve the frontend using a static server:

```bash
npx serve frontend
```

---

## 👤 User Roles

The application supports three main roles:

| Role     | Purpose                                                 |
| -------- | ------------------------------------------------------- |
| Customer | Browse products, manage cart, and place orders          |
| Farmer   | Manage products, stock, and farmer orders               |
| Admin    | Manage users, farmers, products, categories, and orders |

Demo accounts are generated automatically by:

```bash
npm run seed
```

For security, demo passwords are intentionally not published in this README.

---

## 📦 REST API

The backend provides REST API endpoints for major application functionality, including:

```text
/api/auth
/api/products
/api/categories
/api/orders
/api/cart
/api/users
/api/farmers
```

The frontend uses a shared API client located at:

```text
frontend/js/api.js
```

JWT tokens are automatically attached to authenticated API requests.

---

## 🖼️ Product Images

Products support an `images` array in the backend product model.

Example:

```javascript
images: [
  "https://example.com/product-image.jpg"
]
```

The seeded catalog uses product image URLs along with emoji icons as a fallback and as part of the original visual design.

---

## 📊 Current Implementation

The project demonstrates:

* Full-stack frontend/backend integration
* REST API development
* MongoDB data modeling
* Authentication
* Authorization
* Three user roles
* CRUD operations
* Cart management
* Order processing
* Farmer approval workflow
* Product inventory management
* Admin management
* Product images
* Internationalization
* Dark mode
* Git/GitHub workflow
* Cloud deployment

---

## 🔮 Future Improvements

The project can be further enhanced with:

* Direct image uploads from the farmer dashboard
* Product reviews and ratings
* Search suggestion dropdown
* Real-time order notifications
* WebSocket-based updates
* Automated Jest + Supertest API tests
* Docker configuration
* CI/CD pipeline
* Advanced analytics
* Payment gateway integration
* Cloud-based image storage

---

## 🎯 Project Objective

The main objective of Harvest Stall was to transform a frontend marketplace concept into a practical full-stack application.

Through this project, our team worked with:

**Frontend Development → REST APIs → Database Design → Authentication → Authorization → Security → Role-Based Systems → CRUD Operations → Deployment**

The project also demonstrates how an existing frontend design can be extended into a complete full-stack application while maintaining its original visual identity.

---

## 📌 Project Status

**Status: Deployed and Functional ✅**

The application is currently deployed with:

* Frontend hosted on Render
* Backend API hosted on Render
* Database hosted on MongoDB Atlas
* Source code maintained on GitHub

The application is functional and can be accessed through the live frontend URL.

---

## 👥 Project Team

Harvest Stall was developed as a **Community Engagement Project (CEP)** by a team of four students.

### Team Members

1. **Diya Gandhi**
2. **Sakshi Gite**
3. **Siddharth Ghuge**
4. **Girish Godbole**

The project represents collaborative work across frontend development, backend development, database integration, authentication, role-based systems, security, testing, and deployment.

---

## 📚 Academic Project

**Project Type:** Community Engagement Project (CEP)

**Project:** Harvest Stall — Multi-Role Fresh Produce Marketplace

The project was developed as a collaborative academic project to apply practical software development concepts in a real-world marketplace scenario.
