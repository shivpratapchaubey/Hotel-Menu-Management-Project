const mongoose = require('mongoose');
const { getDbMode } = require('../config/db');
const { JsonModel } = require('../config/jsonDb');

const OrderSchema = new mongoose.Schema({
  items: [
    {
      item: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, default: 1 }
    }
  ],
  tableNumber: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'preparing', 'served', 'completed'], 
    default: 'pending' 
  },
  totalAmount: { type: Number, required: true },
  customerDetails: {
    name: { type: String, required: true },
    phone: { type: String }
  },
  note: { type: String },
  feedback: {
    rating: { type: Number },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  },
  createdAt: { type: Date, default: Date.now }
});

const MongoOrder = mongoose.model('Order', OrderSchema);
const JsonOrder = new JsonModel('Order');

const OrderProxy = {
  find: (query) => (getDbMode() === 'mongodb' ? MongoOrder.find(query).sort({ createdAt: -1 }) : JsonOrder.find(query).then(records => records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))),
  findOne: (query) => (getDbMode() === 'mongodb' ? MongoOrder.findOne(query) : JsonOrder.findOne(query)),
  findById: (id) => (getDbMode() === 'mongodb' ? MongoOrder.findById(id) : JsonOrder.findById(id)),
  create: (data) => (getDbMode() === 'mongodb' ? MongoOrder.create(data) : JsonOrder.create(data)),
  findByIdAndUpdate: (id, update, options) => (getDbMode() === 'mongodb' ? MongoOrder.findByIdAndUpdate(id, update, options) : JsonOrder.findByIdAndUpdate(id, update, options)),
  findByIdAndDelete: (id) => (getDbMode() === 'mongodb' ? MongoOrder.findByIdAndDelete(id) : JsonOrder.findByIdAndDelete(id)),
  deleteMany: (query) => (getDbMode() === 'mongodb' ? MongoOrder.deleteMany(query) : JsonOrder.deleteMany(query))
};

module.exports = OrderProxy;
