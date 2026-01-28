import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, HelpCircle, User, Star, X, Plus, Minus, Trash2 } from 'lucide-react';
import { CartProvider, useCart } from './context/CartContext';
import { Home } from './pages/Home';
import { CartPage } from './pages/CartPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminPage } from './pages/AdminPage';
import { AdminListPage } from './pages/AdminListPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { AdminOrderDetailsPage } from './pages/AdminOrderDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { CATEGORIES } from './data';

const STORE_NAME = "Casa & Limpeza Express";

const ProtectedRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  return isAdmin ? children : <Navigate to="/login" replace />;
};

function Layout() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const { cart, updateQty, removeFromCart, cartTotalItems, isDrawerOpen, closeDrawer, openDrawer } = useCart();
  const location = useLocation();

  // Reset category when searching or navigating? Optional.

  return (
    <div className="app">
      {/* Side Drawer */}
      {isDrawerOpen && (
        <>
          <div className="drawer-overlay" onClick={closeDrawer} />
          <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
            <div className="drawer-header">
              <h2 className="drawer-title flex items-center gap-2">
                <ShoppingCart size={24} /> Seu Carrinho
              </h2>
              <button onClick={closeDrawer}>
                <X size={24} />
              </button>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-state">
                  <p>Seu carrinho está vazio.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-info">
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      <p className="text-sm text-gray-500 mb-2">Unidade: {item.unit}</p>
                      <div className="flex justify-between items-center">
                        <div className="qty-controls">
                          <button className="qty-btn" onClick={() => updateQty(item.id, -1)}><Minus size={14} /></button>
                          <span className="px-2 text-sm font-semibold">{item.qty}</span>
                          <button className="qty-btn" onClick={() => updateQty(item.id, 1)}><Plus size={14} /></button>
                        </div>
                        <button
                          className="text-red-500 hover:text-red-700 p-2"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="drawer-footer flex flex-col gap-3">
              <button
                className="w-full py-3 border border-gray-300 rounded-md font-semibold text-gray-600 hover:bg-gray-50"
                onClick={closeDrawer}
              >
                Continuar Comprando
              </button>
              <Link
                to="/carrinho"
                className="w-full py-3 bg-primary text-white rounded-md font-bold text-center flex items-center justify-center gap-2 hover:brightness-90 btn-add"
                onClick={closeDrawer}
                style={{ backgroundColor: 'var(--primary)', color: 'white', textDecoration: 'none' }}
              >
                Solicitar Orçamento
              </Link>
            </div>
          </div>
        </>
      )}
      {/* Header Complexo - Escondido no Login e Admin */}
      {!location.pathname.startsWith('/admin') && location.pathname !== '/login' && (
        <>
          <header className="header">
            {/* ... (conteúdo do header existente) ... */}
            <div className="header-top">
              <div className="container header-content">
                {/* Logo */}
                <Link to="/" className="logo text-decoration-none">
                  <span>bhb</span>
                </Link>

                {/* Search Bar */}
                <div className="header-search">
                  <input
                    type="text"
                    placeholder="O que deseja procurar?"
                    className="header-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="header-search-icon" size={20} />
                </div>

                {/* Actions */}
                <div className="header-actions">
                  <div className="header-action-btn">
                    <HelpCircle size={24} />
                    <span>Atendimento</span>
                  </div>
                  <Link to="/login" className="header-action-btn text-decoration-none">
                    <User size={24} />
                    <span>Minha Conta</span>
                  </Link>
                  <button onClick={openDrawer} className="header-action-btn cart-btn text-decoration-none border-none bg-transparent">
                    <ShoppingCart size={24} />
                    <span>Carrinho</span>
                    {cartTotalItems > 0 && (
                      <span className="cart-count">{cartTotalItems}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Bar */}
            <div className="navbar">
              <div className="container navbar-content">
                <div className="all-cats-btn">
                  <Menu size={24} />
                  <span>Todas Categorias</span>
                </div>

                <div className="nav-links">
                  {CATEGORIES.map(cat => (
                    cat !== "Todos" && (
                      <span
                        key={cat}
                        className={`nav-item ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </span>
                    )
                  ))}
                </div>
              </div>
            </div>
          </header>
        </>
      )}

      {/* Hero Banner - Show only on Home Page */}


      {/* Main Content */}
      <main className={location.pathname.startsWith('/admin') ? '' : 'container'}>
        <Outlet context={{ searchQuery, selectedCategory, setSelectedCategory }} />
      </main>
    </div>
  );
}

function App() {
  return (
    <RouterWrapper />
  );
}

function RouterWrapper() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/carrinho" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/lista"
              element={
                <ProtectedRoute>
                  <AdminListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cadastro"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/editar/:id"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pedidos"
              element={
                <ProtectedRoute>
                  <AdminOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pedido/:id"
              element={
                <ProtectedRoute>
                  <AdminOrderDetailsPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
