import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from '@/context/ToastContext'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import Layout from '@/components/layout/Layout'
import GuardedLayout from '@/components/layout/GuardedLayout'

import Home from '@/pages/Home'
import Shop from '@/pages/Shop'
import ProductDetail from '@/pages/ProductDetail'
import Collections from '@/pages/Collections'
import Offers from '@/pages/Offers'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import Account from '@/pages/Account'
import Wishlist from '@/pages/Wishlist'
import Checkout from '@/pages/Checkout'
import OrderConfirmation from '@/pages/OrderConfirmation'
import NotFound from '@/pages/NotFound'
import Legal from '@/pages/Legal'

import AdminLayout from '@/admin/AdminLayout'
import AdminDashboard from '@/admin/AdminDashboard'
import AdminProducts from '@/admin/AdminProducts'
import AdminProductForm from '@/admin/AdminProductForm'
import AdminOrders from '@/admin/AdminOrders'
import AdminCustomers from '@/admin/AdminCustomers'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                <Route path="/" element={<GuardedLayout />}>
                  <Route element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="shop" element={<Shop />} />
                    <Route path="product/:id" element={<ProductDetail />} />
                    <Route path="collections" element={<Collections />} />
                    <Route path="offers" element={<Offers />} />
                    <Route path="about" element={<About />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                    <Route path="account" element={<Account />} />
                    <Route path="wishlist" element={<Wishlist />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="order-confirmation/:id" element={<OrderConfirmation />} />
                    <Route path="privacy" element={<Legal page="privacy" />} />
                    <Route path="terms" element={<Legal page="terms" />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                  <Route path="admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<AdminProductForm />} />
                    <Route path="products/:id" element={<AdminProductForm />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="customers" element={<AdminCustomers />} />
                  </Route>
                </Route>
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}