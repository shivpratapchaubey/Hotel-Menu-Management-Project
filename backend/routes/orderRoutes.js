const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// @route   POST api/orders
// @desc    Place a new order
// @access  Public
router.post('/', async (req, res) => {
  const { items, tableNumber, totalAmount, customerDetails, note } = req.body;

  if (!items || items.length === 0 || !tableNumber || !customerDetails || !customerDetails.name) {
    return res.status(400).json({ msg: 'Please provide items, table number, and customer details' });
  }

  try {
    const newOrder = await Order.create({
      items,
      tableNumber,
      totalAmount: parseFloat(totalAmount),
      customerDetails,
      note: note || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/orders
// @desc    Get all orders
// @access  Private (Admin/Staff)
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/orders/:id/status
// @desc    Update order preparation/serving status
// @access  Private (Admin/Kitchen Staff)
router.put('/:id/status', auth, async (req, res) => {
  const { status } = req.body;

  if (!['pending', 'preparing', 'served', 'completed'].includes(status)) {
    return res.status(400).json({ msg: 'Invalid order status' });
  }

  try {
    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/orders/:id/feedback
// @desc    Provide feedback/rating on an order
// @access  Public (Customer)
router.post('/:id/feedback', async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating) {
    return res.status(400).json({ msg: 'Rating is required' });
  }

  try {
    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    order.feedback = {
      rating: parseInt(rating),
      comment: comment || '',
      createdAt: new Date().toISOString()
    };

    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/orders/analytics
// @desc    Get dashboard metrics & trends
// @access  Private (Admin)
router.get('/analytics', auth, async (req, res) => {
  try {
    const orders = await Order.find();
    
    // 1. Core KPIs
    const totalOrders = orders.length;
    
    const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'served');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    const feedbackOrders = orders.filter(o => o.feedback && o.feedback.rating);
    const averageFeedback = feedbackOrders.length > 0
      ? parseFloat((feedbackOrders.reduce((sum, o) => sum + o.feedback.rating, 0) / feedbackOrders.length).toFixed(1))
      : 0;

    const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
    const preparingOrdersCount = orders.filter(o => o.status === 'preparing').length;

    // 2. Status Distribution
    const statusDistribution = {
      pending: orders.filter(o => o.status === 'pending').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      served: orders.filter(o => o.status === 'served').length,
      completed: orders.filter(o => o.status === 'completed').length
    };

    // 3. Popular Items calculation
    const itemMap = {};
    orders.forEach(order => {
      // Check both mongoose/json formats
      const items = order.items || [];
      items.forEach(item => {
        const name = item.name;
        const qty = item.quantity || 1;
        const revenue = (item.price || 0) * qty;
        if (!itemMap[name]) {
          itemMap[name] = { name, quantity: 0, revenue: 0 };
        }
        itemMap[name].quantity += qty;
        itemMap[name].revenue += revenue;
      });
    });

    const popularItems = Object.values(itemMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // 4. Simulated Daily Sales Trend (group by last 7 days)
    const salesTrend = {};
    // Seed last 7 days to guarantee 0 data showing nicely
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      salesTrend[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
    }

    orders.forEach(order => {
      if (order.status === 'completed' || order.status === 'served') {
        const dateObj = new Date(order.createdAt);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (salesTrend[dateStr]) {
          salesTrend[dateStr].revenue += order.totalAmount;
          salesTrend[dateStr].orders += 1;
        }
      }
    });

    res.json({
      summary: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders,
        averageFeedback,
        activeOrders: pendingOrdersCount + preparingOrdersCount
      },
      statusDistribution,
      popularItems,
      salesTrend: Object.values(salesTrend)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
