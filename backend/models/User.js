const mongoose = require('mongoose');
const { getDbMode } = require('../config/db');
const { JsonModel } = require('../config/jsonDb');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

const MongoUser = mongoose.model('User', UserSchema);
const JsonUser = new JsonModel('User');

const UserProxy = {
  find: (query) => (getDbMode() === 'mongodb' ? MongoUser.find(query) : JsonUser.find(query)),
  findOne: (query) => (getDbMode() === 'mongodb' ? MongoUser.findOne(query) : JsonUser.findOne(query)),
  findById: (id) => (getDbMode() === 'mongodb' ? MongoUser.findById(id) : JsonUser.findById(id)),
  create: (data) => (getDbMode() === 'mongodb' ? MongoUser.create(data) : JsonUser.create(data)),
  findByIdAndUpdate: (id, update, options) => (getDbMode() === 'mongodb' ? MongoUser.findByIdAndUpdate(id, update, options) : JsonUser.findByIdAndUpdate(id, update, options)),
  findByIdAndDelete: (id) => (getDbMode() === 'mongodb' ? MongoUser.findByIdAndDelete(id) : JsonUser.findByIdAndDelete(id)),
  deleteMany: (query) => (getDbMode() === 'mongodb' ? MongoUser.deleteMany(query) : JsonUser.deleteMany(query))
};

module.exports = UserProxy;
