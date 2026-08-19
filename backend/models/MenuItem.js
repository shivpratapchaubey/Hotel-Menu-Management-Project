const mongoose = require('mongoose');
const { getDbMode } = require('../config/db');
const { JsonModel } = require('../config/jsonDb');

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  tags: [String],
  dietaryType: { type: String, enum: ['veg', 'non-veg', 'vegan', 'gluten-free'], default: 'veg' },
  allergens: [String],
  ingredients: [String],
  calories: Number,
  prepTime: Number, // in minutes
  isAvailable: { type: Boolean, default: true },
  reviews: [
    {
      customerName: String,
      rating: Number,
      comment: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  averageRating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const MongoMenuItem = mongoose.model('MenuItem', MenuItemSchema);
const JsonMenuItem = new JsonModel('MenuItem');

// Proxy object that forwards requests based on active database mode
const MenuItemProxy = {
  find: (query) => (getDbMode() === 'mongodb' ? MongoMenuItem.find(query) : JsonMenuItem.find(query)),
  findOne: (query) => (getDbMode() === 'mongodb' ? MongoMenuItem.findOne(query) : JsonMenuItem.findOne(query)),
  findById: (id) => (getDbMode() === 'mongodb' ? MongoMenuItem.findById(id) : JsonMenuItem.findById(id)),
  create: (data) => (getDbMode() === 'mongodb' ? MongoMenuItem.create(data) : JsonMenuItem.create(data)),
  findByIdAndUpdate: (id, update, options) => (getDbMode() === 'mongodb' ? MongoMenuItem.findByIdAndUpdate(id, update, options) : JsonMenuItem.findByIdAndUpdate(id, update, options)),
  findByIdAndDelete: (id) => (getDbMode() === 'mongodb' ? MongoMenuItem.findByIdAndDelete(id) : JsonMenuItem.findByIdAndDelete(id)),
  deleteMany: (query) => (getDbMode() === 'mongodb' ? MongoMenuItem.deleteMany(query) : JsonMenuItem.deleteMany(query))
};

module.exports = MenuItemProxy;
