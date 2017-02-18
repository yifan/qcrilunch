const mongoose = require('mongoose')

const configDatabase = require('../../config/database.js');
mongoose.connect(configDatabase.url);

const Dish = require('../models/dish');

const optnames = [
"KongPo Chicken",
"Beef Dumpling(Steam)",
"Beef Dumpling(Pan)",
"Beef Dumpling(Boiled)",
"Chicken Dumpling(Steam)",
"Chicken Dumpling(Pan)",
"Chichen Dumpling(Boiled)",
"Beef Steamed Bao",
"Veg Steamed Bao",
"Plain Steamed Bao",
"Floral Steamed Bao",
];

const optprices = [
36,
30,
30,
30,
30,
30,
30,
4,
4,
4,
4,
];


const names = [
"宫保鸡丁",
"麻婆豆腐",
"葱爆羊肉",
"肉末茄子",
"尖椒炒肉片",
"蚂蚁上树",
"香辣肉丝",
"酸辣土豆丝",
];

const prices = [
36,
30,
38,
30,
38,
32,
38,
26,
];


var p1 = new Promise(function(resolve, reject) {
  optnames.map((name, index) => {
    const price = optprices[index];
    Dish.create({
      name: name,
      price: price,
      proto: null,
      available: true,
      shared: 0,
    }, (err, dish) => {
      if (err) {
        reject('Failed');
      }
      else {
        resolve('success');
      }
    });
  });
});

var p2 = new Promise((resolve, reject) => {
  names.map((name, index) => {
    const price = prices[index];
    Dish.create({
      name: name,
      price: price,
      proto: null,
      available: false,
      shared: index + 1,
    }, (err, dish) => {
      if (err) {
        reject('failed');
      }
      else {
        resolve('success');
      }
    });
  });
});


p1.then((res) => { p2.then((r) => { process.exit(); }) });
