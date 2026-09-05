import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Moon, 
  Sun, 
  ShoppingBag, 
  User, 
  Sparkles, 
  LayoutDashboard, 
  ClipboardList, 
  FileEdit, 
  Tags, 
  LogOut, 
  LogIn, 
  HelpCircle,
  QrCode
} from 'lucide-react';
import './App.css';

// Components
import ClientMenu from './components/ClientMenu';
import ItemDetailModal from './components/ItemDetailModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderTracker from './components/OrderTracker';
import AdminDashboard from './components/AdminDashboard';
import AdminOrders from './components/AdminOrders';
import AdminMenu from './components/AdminMenu';
import AdminCategories from './components/AdminCategories';

import { API_BASE } from './config';

export default function App() {
  // Theme & Layout state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState('orders'); // orders, dashboard, menu, categories
  const [activeOrderId, setActiveOrderId] = useState(localStorage.getItem('activeOrderId') || null);

  // Data states
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [note, setNote] = useState('');
  const [tableNumber, setTableNumber] = useState('1');

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showTableSelectQR, setShowTableSelectQR] = useState(false);

  // Auth states
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [username, setUsername] = useState(localStorage.getItem('adminUsername') || '');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Fetch Menu and Categories from Backend APIs
  const refreshData = async () => {
    try {
      const menuRes = await fetch(`${API_BASE}/menu`);
      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setMenuItems(menuData);
      }
      
      const catRes = await fetch(`${API_BASE}/categories`);
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
    } catch (error) {
      console.error("API connection failed:", error);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Theme Toggler helper
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Cart Operations
  const handleAddToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(ci => ci._id === item._id);
      if (existing) {
        return prev.map(ci => ci._id === item._id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQty = (itemId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCartItems(prev => prev.map(ci => ci._id === itemId ? { ...ci, quantity: newQty } : ci));
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(prev => prev.filter(ci => ci._id !== itemId));
  };

  const handleCheckoutSubmit = async (checkoutData) => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const totalAmount = subtotal + tax + (subtotal > 0 ? 3.99 : 0);

    const orderPayload = {
      items: cartItems.map(ci => ({
        item: ci._id,
        name: ci.name,
        price: ci.price,
        quantity: ci.quantity
      })),
      tableNumber: checkoutData.tableNumber,
      totalAmount,
      customerDetails: {
        name: checkoutData.name,
        phone: checkoutData.phone
      },
      note
    };

    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) throw new Error('Order submission failed');
      const data = await response.json();
      
      // Save order tracking ID
      setActiveOrderId(data._id);
      localStorage.setItem('activeOrderId', data._id);
      setTableNumber(checkoutData.tableNumber);

      // Reset cart
      setCartItems([]);
      setNote('');
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
    } catch (err) {
      alert("Error sending order to kitchen. Please try again.");
    }
  };

  // Add review to a menu item
  const handleAddReview = async (itemId, reviewData) => {
    try {
      const response = await fetch(`${API_BASE}/menu/${itemId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      if (response.ok) {
        refreshData(); // Refresh scores and review lists
        // If we have selected item modal active, update its local structure
        setSelectedItem(prev => {
          if (!prev || prev._id !== itemId) return prev;
          const reviews = prev.reviews ? [...prev.reviews, reviewData] : [reviewData];
          const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
          const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));
          return { ...prev, reviews, averageRating };
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Admin login request
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Authentication failed');
      }

      // Save token
      setToken(data.token);
      setUsername(data.username);
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUsername', data.username);
      
      setShowLoginModal(false);
      setIsAdmin(true);
      setLoginUsername('');
      setLoginPassword('');
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleAdminLogout = () => {
    setToken(null);
    setUsername('');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    setIsAdmin(false);
  };

  return (
    <div className="app-container">
      {/* Navbar header */}
      <header className="navbar glassmorphism">
        <div className="nav-brand" onClick={() => setIsAdmin(false)} style={{ cursor: 'pointer' }}>
          <Utensils className="logo-icon" size={28} style={{ strokeWidth: 2.5 }} />
          <h1 className="brand-text text-gradient">Grand Royal</h1>
        </div>

        {/* Dynamic Nav Controls */}
        <div className="nav-actions">
          {/* Table Indicator for customer */}
          {!isAdmin && activeOrderId && (
            <span className="table-badge">Table {tableNumber}</span>
          )}

          {/* Theme Switcher */}
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Table select QR display */}
          {!isAdmin && (
            <button 
              onClick={() => setShowTableSelectQR(true)} 
              className="theme-toggle" 
              title="Table QR simulator"
              aria-label="Table QR Code"
            >
              <QrCode size={18} />
            </button>
          )}

          {/* Client Cart Button */}
          {!isAdmin && !activeOrderId && (
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="cart-trigger"
              aria-label="Open cart drawer"
            >
              <ShoppingBag size={18} />
              {cartItems.length > 0 && <span className="cart-badge">{cartItems.length}</span>}
            </button>
          )}

          {/* Admin Mode Switcher */}
          {token ? (
            <button 
              onClick={() => setIsAdmin(!isAdmin)} 
              className="admin-toggle"
              style={{ borderColor: isAdmin ? 'var(--primary)' : 'transparent', color: isAdmin ? 'var(--primary)' : 'var(--text-main)' }}
            >
              <User size={18} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, marginLeft: '0.4rem', display: 'inline-block' }}>
                {isAdmin ? 'Exit Admin' : 'Admin Panel'}
              </span>
            </button>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="admin-toggle">
              <LogIn size={18} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, marginLeft: '0.4rem' }}>Admin Log</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {isAdmin ? (
          /* Admin Panel Layout */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="admin-nav-bar" style={{ background: 'var(--surface-hover)', padding: '0.5rem' }}>
              <div className="admin-nav" style={{ maxWidth: '1400px', margin: '0 auto', borderBottom: 'none', paddingBottom: 0 }}>
                <button 
                  className={`admin-nav-item ${adminTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setAdminTab('orders')}
                >
                  <ClipboardList size={14} style={{ marginRight: '0.4rem', display: 'inline' }} />
                  Live Orders (KOT)
                </button>
                <button 
                  className={`admin-nav-item ${adminTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setAdminTab('dashboard')}
                >
                  <LayoutDashboard size={14} style={{ marginRight: '0.4rem', display: 'inline' }} />
                  Analytics Dashboard
                </button>
                <button 
                  className={`admin-nav-item ${adminTab === 'menu' ? 'active' : ''}`}
                  onClick={() => setAdminTab('menu')}
                >
                  <FileEdit size={14} style={{ marginRight: '0.4rem', display: 'inline' }} />
                  Menu Manager
                </button>
                <button 
                  className={`admin-nav-item ${adminTab === 'categories' ? 'active' : ''}`}
                  onClick={() => setAdminTab('categories')}
                >
                  <Tags size={14} style={{ marginRight: '0.4rem', display: 'inline' }} />
                  Categories Editor
                </button>
                
                <button 
                  className="admin-nav-item" 
                  onClick={handleAdminLogout}
                  style={{ marginLeft: 'auto', color: 'var(--accent-nonveg)' }}
                >
                  <LogOut size={14} style={{ marginRight: '0.4rem', display: 'inline' }} />
                  Log Out ({username})
                </button>
              </div>
            </div>

            {adminTab === 'orders' && <AdminOrders token={token} />}
            {adminTab === 'dashboard' && <AdminDashboard token={token} />}
            {adminTab === 'menu' && (
              <AdminMenu 
                menuItems={menuItems} 
                categories={categories} 
                token={token} 
                onRefreshData={refreshData} 
              />
            )}
            {adminTab === 'categories' && (
              <AdminCategories 
                categories={categories} 
                token={token} 
                onRefreshData={refreshData} 
              />
            )}
          </div>
        ) : (
          /* Client Front-end Layout */
          activeOrderId ? (
            /* If customer has an active order, direct them to track its preparation */
            <OrderTracker 
              orderId={activeOrderId}
              onCloseTracker={() => {
                setActiveOrderId(null);
                localStorage.removeItem('activeOrderId');
              }}
            />
          ) : (
            /* Main menu card listings */
            <ClientMenu 
              menuItems={menuItems}
              categories={categories}
              cartItems={cartItems}
              onSelectItem={(item) => setSelectedItem(item)}
              onAddToCart={handleAddToCart}
            />
          )
        )}
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <ItemDetailModal 
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
          onAddReview={handleAddReview}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => setIsCheckoutOpen(true)}
        note={note}
        onUpdateNote={setNote}
      />

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal 
          onClose={() => setIsCheckoutOpen(false)}
          onSubmit={handleCheckoutSubmit}
          defaultTable={tableNumber}
        />
      )}

      {/* Table Select QR simulation overlay */}
      {showTableSelectQR && (
        <div className="modal-backdrop" onClick={() => setShowTableSelectQR(false)}>
          <div className="detail-modal glassmorphism" style={{ maxWidth: '400px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div className="cart-header" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontWeight: 700 }}>Table QR Code Sim</h3>
            </div>
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Diners scan table QR codes to access table-specific menu settings.
              </p>
              
              <div className="qr-code-mock" style={{ width: '180px', height: '180px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Visual Representation of QR */}
                <QrCode size={140} style={{ color: '#000' }} />
              </div>
              
              <div className="form-group" style={{ width: '100%' }}>
                <label className="form-label">Simulate scanning Table Number:</label>
                <select 
                  className="form-control"
                  value={tableNumber}
                  onChange={e => {
                    setTableNumber(e.target.value);
                    setShowTableSelectQR(false);
                  }}
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <option key={n} value={String(n)}>Table #{n}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="modal-backdrop" onClick={() => setShowLoginModal(false)}>
          <div className="detail-modal glassmorphism" style={{ maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
            <div className="cart-header" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontWeight: 700 }}>Staff Authorization</h3>
            </div>

            <form onSubmit={handleAdminLogin} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {loginError && (
                <div style={{ color: 'var(--accent-nonveg)', background: 'var(--accent-nonveg-glow)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                  ⚠️ {loginError}
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">Username</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  placeholder="e.g. admin"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-control"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Default credentials seeded: admin / admin123
              </p>

              <button type="submit" className="place-order-btn" style={{ marginTop: '0.5rem' }}>
                Log In
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
