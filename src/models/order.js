const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Order = new Schema({
  user: String,
  updated: { type: Date, default: Date.now },
  lunch: Schema.ObjectId,
  shared: Boolean,
  dishes: [],
});

module.exports = mongoose.model('Order', Order)
