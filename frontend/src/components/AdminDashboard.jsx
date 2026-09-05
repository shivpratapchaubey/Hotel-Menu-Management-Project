import React, { useState, useEffect } from 'react';
import { IndianRupee, ShoppingBag, Flame, Star, Award, TrendingUp } from 'lucide-react';
import { API_BASE } from '../config';

export default function AdminDashboard({ token }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${API_BASE}/orders/analytics`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const data = await response.json();
        setAnalytics(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAnalytics();
    // Poll every 10 seconds for real-time analytics
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        <h3>Loading dashboard reports...</h3>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--accent-nonveg)' }}>
        <h3>Error Loading Analytics</h3>
        <p>{error || 'Something went wrong.'}</p>
      </div>
    );
  }

  const { summary, statusDistribution, popularItems, salesTrend } = analytics;

  // Find max sales trend revenue to scale chart heights proportionally (140px max height)
  const maxRevenue = Math.max(...salesTrend.map(day => day.revenue), 10);

  return (
    <div className="admin-container animate-fade">
      
      {/* Metrics Row */}
      <section className="kpi-grid">
        <div className="kpi-card glassmorphism">
          <div className="kpi-icon-box">
            <IndianRupee size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-val">₹{summary.totalRevenue.toFixed(2)}</span>
            <span className="kpi-lbl">Total Revenue</span>
          </div>
        </div>

        <div className="kpi-card glassmorphism">
          <div className="kpi-icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <ShoppingBag size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-val">{summary.totalOrders}</span>
            <span className="kpi-lbl">Total Orders</span>
          </div>
        </div>

        <div className="kpi-card glassmorphism">
          <div className="kpi-icon-box" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-nonveg)' }}>
            <Flame size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-val">{summary.activeOrders}</span>
            <span className="kpi-lbl">Active Cooking</span>
          </div>
        </div>

        <div className="kpi-card glassmorphism">
          <div className="kpi-icon-box" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
            <Star size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-val">{summary.averageFeedback > 0 ? `${summary.averageFeedback} / 5` : 'N/A'}</span>
            <span className="kpi-lbl">Average Rating</span>
          </div>
        </div>
      </section>

      {/* Main Charts & Lists Grid */}
      <section className="dashboard-grid">
        
        {/* Sales Trend simulated bar chart */}
        <div className="analytics-panel glassmorphism">
          <h3 className="category-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
            <span>Weekly Sales Trend (₹)</span>
          </h3>
          
          <div className="chart-simulated">
            {salesTrend.map((day, idx) => {
              // Scale height percentage relative to maxRevenue
              const pct = (day.revenue / maxRevenue) * 100;
              return (
                <div key={idx} className="chart-bar-col">
                  <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>₹{day.revenue.toFixed(0)}</span>
                  <div className="chart-bar-wrapper">
                    <div 
                      className="chart-bar" 
                      style={{ height: `${pct > 0 ? Math.max(pct, 5) : 0}%` }}
                    />
                  </div>
                  <span className="chart-lbl">{day.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Dishes List */}
        <div className="analytics-panel glassmorphism">
          <h3 className="category-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Award size={18} style={{ color: 'var(--secondary)' }} />
            <span>Top Sellers</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {popularItems.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                No food sales data available yet.
              </p>
            ) : (
              popularItems.map((item, idx) => (
                <div key={idx} className="popular-item-row">
                  <div>
                    <div className="popular-item-name">{item.name}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.quantity} sold</span>
                  </div>
                  <span className="popular-item-stats">₹{item.revenue.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </section>

    </div>
  );
}
