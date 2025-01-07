# E-commerce Web Application

A full-stack e-commerce application built with the MERN stack (MongoDB, Express.js, React, Node.js), featuring a modern UI with Tailwind CSS and comprehensive e-commerce functionality.

## Features

### Customer Features
- User authentication (Register/Login)
- Product browsing with search and filters
- Shopping cart management
- Checkout process
- Order tracking
- User profile management
- Address management
- Password change functionality

### Admin Features
- Dashboard with sales analytics
- Product management (CRUD operations)
- Category management
- Order management
- User management
- Stock management

## Tech Stack

### Frontend
- React.js
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS for styling
- Recharts for analytics visualization
- Axios for API requests
- Date-fns for date formatting

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing

## Project Structure

```
ecommerce-project/
├── client/                # Frontend React application
│   ├── src/
│   │   ├── app/          # Redux store configuration
│   │   ├── components/   # Reusable components
│   │   ├── features/     # Redux slices and features
│   │   ├── pages/        # Page components
│   │   └── utils/        # Utility functions
│   
├── server/               # Backend Node.js application
│   ├── controllers/      # Request handlers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── server.js        # Entry point
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ecommerce-project
```

2. Install backend dependencies
```bash
cd server
npm install
```

3. Install frontend dependencies
```bash
cd client
npm install
```

4. Create a .env file in the server directory with the following variables
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/webstack_ecommerce
JWT_SECRET=your_jwt_secret
```

5. Start the backend server
```bash
cd server
nodemon server.js
```

6. Start the frontend application
```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173` (frontend) and `http://localhost:4000` (backend)

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get single product
- `POST /api/v1/products` - Create product (Admin)
- `PUT /api/v1/products/:id` - Update product (Admin)
- `DELETE /api/v1/products/:id` - Delete product (Admin)

### Categories
- `GET /api/v1/categories` - Get all categories
- `POST /api/v1/categories` - Create category (Admin)
- `PUT /api/v1/categories/:id` - Update category (Admin)
- `DELETE /api/v1/categories/:id` - Delete category (Admin)

### Cart
- `GET /api/v1/cart` - Get user's cart
- `POST /api/v1/cart/add` - Add item to cart
- `PUT /api/v1/cart/update` - Update cart item
- `DELETE /api/v1/cart/remove/:product_id/:variant_id` - Remove item from cart

### Orders
- `POST /api/v1/orders/create` - Create order
- `GET /api/v1/orders/user-orders` - Get user's orders
- `GET /api/v1/orders/admin/orders` - Get all orders (Admin)
- `PUT /api/v1/orders/:id/status` - Update order status (Admin)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

- [React Documentation](https://reactjs.org/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
