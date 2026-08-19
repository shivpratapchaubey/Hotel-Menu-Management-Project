const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');

// @route   GET api/menu
// @desc    Get all menu items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/menu/:id
// @desc    Get a single menu item
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Menu item not found' });
    }
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/menu
// @desc    Create a menu item
// @access  Private (Admin)
router.post('/', auth, async (req, res) => {
  const {
    name,
    description,
    price,
    category,
    image,
    tags,
    dietaryType,
    allergens,
    ingredients,
    calories,
    prepTime
  } = req.body;

  // Simple validation
  if (!name || !price || !category) {
    return res.status(400).json({ msg: 'Please enter name, price, and category' });
  }

  try {
    const newItem = await MenuItem.create({
      name,
      description: description || '',
      price: parseFloat(price),
      category,
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop',
      tags: tags || [],
      dietaryType: dietaryType || 'veg',
      allergens: allergens || [],
      ingredients: ingredients || [],
      calories: calories ? parseInt(calories) : null,
      prepTime: prepTime ? parseInt(prepTime) : 15,
      isAvailable: true,
      reviews: [],
      averageRating: 0
    });

    res.json(newItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/menu/:id
// @desc    Update a menu item
// @access  Private (Admin)
router.put('/:id', auth, async (req, res) => {
  const {
    name,
    description,
    price,
    category,
    image,
    tags,
    dietaryType,
    allergens,
    ingredients,
    calories,
    prepTime,
    isAvailable
  } = req.body;

  try {
    let item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Menu item not found' });
    }

    const updatedData = {
      name,
      description,
      price: price ? parseFloat(price) : item.price,
      category,
      image,
      tags,
      dietaryType,
      allergens,
      ingredients,
      calories: calories ? parseInt(calories) : item.calories,
      prepTime: prepTime ? parseInt(prepTime) : item.prepTime,
      isAvailable: isAvailable !== undefined ? isAvailable : item.isAvailable
    };

    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.json(updatedItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/menu/:id
// @desc    Delete a menu item
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    let item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Menu item not found' });
    }

    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Menu item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/menu/:id/reviews
// @desc    Add review to a menu item
// @access  Public (Customer)
router.post('/:id/reviews', async (req, res) => {
  const { customerName, rating, comment } = req.body;

  if (!rating) {
    return res.status(400).json({ msg: 'Rating is required' });
  }

  try {
    let item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Menu item not found' });
    }

    const newReview = {
      customerName: customerName || 'Anonymous Customer',
      rating: parseInt(rating),
      comment: comment || '',
      createdAt: new Date()
    };

    // Use findByIdAndUpdate with $push to update in a Mongoose/JSON DB friendly way
    // For proxy compatibility, we can modify the object direct and save, which is fully supported in both Mongo and JsonDb wrapper!
    item.reviews.push(newReview);
    
    // Calculate new average rating
    const totalRating = item.reviews.reduce((sum, rev) => sum + rev.rating, 0);
    item.averageRating = parseFloat((totalRating / item.reviews.length).toFixed(1));

    await item.save();

    res.status(201).json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
