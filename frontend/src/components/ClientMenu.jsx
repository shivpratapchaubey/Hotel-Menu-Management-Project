import React, { useState, useEffect } from 'react';
import { Search, Flame, Award, Leaf, ShieldAlert, Sparkles, Star } from 'lucide-react';

export default function ClientMenu({ 
  menuItems, 
  categories, 
  onSelectItem, 
  onAddToCart,
  cartItems 
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState('all'); // all, veg, non-veg, vegan
  const [sortBy, setSortBy] = useState('default'); // default, price-low, price-high, rating

  // Filter & Sort Items
  const filteredItems = menuItems.filter(item => {
    // Category check
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    
    // Search check
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    // Diet check
    let matchesDiet = true;
    if (dietFilter === 'veg') {
      matchesDiet = item.dietaryType === 'veg' || item.dietaryType === 'vegan';
    } else if (dietFilter === 'non-veg') {
      matchesDiet = item.dietaryType === 'non-veg';
    } else if (dietFilter === 'vegan') {
      matchesDiet = item.dietaryType === 'vegan';
    }

    return matchesCategory && matchesSearch && matchesDiet;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.averageRating - a.averageRating;
    return 0; // default (createdAt / database order)
  });

  return (
    <main className="menu-layout animate-fade">
      {/* Categories Sidebar */}
      <aside className="category-sidebar glassmorphism">
        <h3 className="category-title">Categories</h3>
        <button 
          className={`category-btn ${selectedCategory === 'All' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('All')}
        >
          <Sparkles size={18} />
          <span>All Items</span>
        </button>
        {categories.map((cat) => (
          <button 
            key={cat._id}
            className={`category-btn ${selectedCategory === cat.name ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.name)}
          >
            <span>{cat.name}</span>
          </button>
        ))}
      </aside>

      {/* Main Menu Grid / Container */}
      <section className="menu-content">
        <div className="menu-content-header">
          <h2 className="text-gradient" style={{ fontSize: '2rem' }}>
            {selectedCategory === 'All' ? 'Our Exquisite Menu' : selectedCategory}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Explore our curated culinary delights, crafted with fresh ingredients by world-class chefs.
          </p>

          {/* Search and Filters Layout */}
          <div className="search-filter-row">
            <div className="search-container">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search culinary creations, tags, ingredients..." 
                className="search-input glassmorphism"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <button 
                className={`filter-btn ${dietFilter === 'all' ? 'active' : ''}`}
                onClick={() => setDietFilter('all')}
              >
                All Foods
              </button>
              <button 
                className={`filter-btn veg ${dietFilter === 'veg' ? 'active' : ''}`}
                onClick={() => setDietFilter('veg')}
              >
                <Leaf size={14} style={{ color: 'var(--accent-veg)' }} /> Veg Only
              </button>
              <button 
                className={`filter-btn nonveg ${dietFilter === 'non-veg' ? 'active' : ''}`}
                onClick={() => setDietFilter('non-veg')}
              >
                <Flame size={14} style={{ color: 'var(--accent-nonveg)' }} /> Non-Veg
              </button>
              
              <select 
                className="filter-btn" 
                style={{ paddingRight: '1rem', border: '1px solid var(--surface-border)', background: 'var(--surface)' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Sort: Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating: Highly Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <ShieldAlert size={48} style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
            <h3>No culinary dishes found</h3>
            <p>Try resetting your filters or modifying your search query.</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filteredItems.map((item) => {
              const cartItem = cartItems.find(ci => ci._id === item._id);
              const quantityInCart = cartItem ? cartItem.quantity : 0;
              
              return (
                <div 
                  key={item._id} 
                  className="item-card glassmorphism animate-slide-up"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectItem(item)}
                >
                  <div className="item-img-container">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="item-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop';
                      }}
                    />
                    <span className={`diet-tag ${item.dietaryType}`}>
                      {item.dietaryType === 'veg' && 'Veg'}
                      {item.dietaryType === 'non-veg' && 'Non-Veg'}
                      {item.dietaryType === 'vegan' && 'Vegan'}
                    </span>
                  </div>

                  <div className="item-details-body">
                    <div className="item-name-row">
                      <h3 className="item-card-name">{item.name}</h3>
                      {item.averageRating > 0 && (
                        <span className="item-card-rating">
                          <Star size={12} fill="var(--primary)" />
                          {item.averageRating}
                        </span>
                      )}
                    </div>

                    <p className="item-card-desc">{item.description}</p>

                    <div className="item-card-footer" onClick={(e) => e.stopPropagation()}>
                      <span className="item-card-price">₹{item.price.toFixed(2)}</span>
                      {item.isAvailable ? (
                        <button 
                          className="add-cart-btn"
                          onClick={() => onAddToCart(item)}
                        >
                          Add to Cart {quantityInCart > 0 && `(${quantityInCart})`}
                        </button>
                      ) : (
                        <span className="out-of-stock-badge">Sold Out</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
