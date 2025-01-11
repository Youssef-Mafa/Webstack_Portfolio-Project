import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProductList from "./pages/products/ProductList";
import ProductDetail from './pages/products/ProductDetail'
import Cart from "./pages/cart/Cart";
import Layout from "./components/layout/Layout";
import PrivateRoute from "./components/layout/PrivateRoute";
import Checkout from "./pages/checkout/checkout";
import ThankYou from "./pages/thank-you/thank-you";
import Profile from "./pages/profile/Profile";

import AdminLayout from './components/admin/AdminLayout';
import AdminRoute from './components/admin/AdminRoute';
import Dashboard from './components/admin/Dashboard';
import ProductManagement from './components/admin/products/ProductManagement';
import CategoryManagement from './components/admin/categories/CategoryManagement';
import OrderManagement from './components/admin/orders/OrderManagement';


function App() {
  return (
    <Router>
      <Routes>
        {/* Main Layout Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          
          {/* Protected Customer Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="thank-you" element={<ThankYou />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/products" element={<ProductManagement />} />
              <Route path="/admin/categories" element={<CategoryManagement />} />
              <Route path="/admin/orders" element={<OrderManagement />} />
              
            </Route>
          </Route>

      </Routes>
    </Router>
  );
}

export default App;