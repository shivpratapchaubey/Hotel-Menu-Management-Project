const mongoose = require('mongoose');
const { getDbMode } = require('../config/db');
const { JsonModel } = require('../config/jsonDb');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  icon: { type: String }, // name of the lucide-react icon, e.g., 'Coffee', 'Pizza'
  createdAt: { type: Date, default: Date.now }
});

const MongoCategory = mongoose.model('Category', CategorySchema);
const JsonCategory = new JsonModel('Category');

const CategoryProxy = {
  find: (query) => (getDbMode() === 'mongodb' ? MongoCategory.find(query) : JsonCategory.find(query)),
  findOne: (query) => (getDbMode() === 'mongodb' ? MongoCategory.findOne(query) : JsonCategory.findOne(query)),
  findById: (id) => (getDbMode() === 'mongodb' ? MongoCategory.findById(id) : JsonCategory.findById(id)),
  create: (data) => (getDbMode() === 'mongodb' ? MongoCategory.create(data) : JsonCategory.create(data)),
  findByIdAndUpdate: (id, update, options) => (getDbMode() === 'mongodb' ? MongoCategory.findByIdAndUpdate(id, update, options) : JsonCategory.findByIdAndUpdate(id, update, options)),
  findByIdAndDelete: (id) => (getDbMode() === 'mongodb' ? MongoCategory.findByIdAndDelete(id) : JsonCategory.findByIdAndDelete(id)),
  deleteMany: (query) => (getDbMode() === 'mongodb' ? MongoCategory.deleteMany(query) : JsonCategory.deleteMany(query))
};

module.exports = CategoryProxy;
