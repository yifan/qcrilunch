const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Lunch = new Schema({
  user: String,
  when: { type: Date },
});

module.exports = mongoose.model('Lunch', Lunch)
