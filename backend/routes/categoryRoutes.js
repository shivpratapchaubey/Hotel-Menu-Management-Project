const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');

// @route   GET api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/categories
// @desc    Create a new category
// @access  Private (Admin)
router.post('/', auth, async (req, res) => {
  const { name, description, icon } = req.body;

  if (!name) {
    return res.status(400).json({ msg: 'Please enter category name' });
  }

  try {
    // Check if category already exists
    let existingCat = await Category.findOne({ name });
    if (existingCat) {
      return res.status(400).json({ msg: 'Category already exists' });
    }

    const newCategory = await Category.create({
      name,
      description,
      icon: icon || 'Utensils'
    });

    res.json(newCategory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/categories/:id
// @desc    Update a category
// @access  Private (Admin)
router.put('/:id', auth, async (req, res) => {
  const { name, description, icon } = req.body;

  try {
    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    const updatedData = { name, description, icon };
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.json(updatedCategory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/categories/:id
// @desc    Delete a category
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Category removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
