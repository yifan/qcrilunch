const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Dish = new Schema({
  name: String,
  price: Number,
  photo: String,
  available: Boolean,
  shared: Number,
});

module.exports = mongoose.model('Dish', Dish)
