const express = require('express');
const path = require('path');
//const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

console.log(process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI);

const app = express()  

//app.use(favicon(__dirname + 'public/favicon.ico'));
// Setup logger
app.use(logger(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


const User = require('./src/models/user');
const Dish = require('./src/models/dish');
const Order = require('./src/models/order');
const Lunch = require('./src/models/lunch');

app.use(session({  
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  secret: 'foo',
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())  
app.use(passport.session()) 

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  (req, res) => {
    res.cookie('user', JSON.stringify({email: req.user.email}));
    res.send('OK');
  }
);

app.post('/signup', (req, res, next) => {
  User.register(new User({email: req.body.email}), req.body.password, (err) => {
    if (err) {
      console.log('error while user register!', err);
      return next(err);
    } 
    passport.authenticate('local')(req, res, () => {
      res.cookie('user', JSON.stringify({email: req.user.email}));
      res.send('OK');
    });
  });
});

app.get('/logout', (req, res) => {
  res.clearCookie('user');
  req.logout();
  res.send('OK');
});

app.get('/api/menu', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  var query = Dish.find({ available: true });
  query.select('name price');
  query.exec((err, dishes) => {
    if (!err) {
      res.send(JSON.stringify(dishes));
    }
    else {
      res.send(JSON.stringify({err: err}));
    }
  });
});

app.get('/api/order', (req, res) => {
  if (!req.user) {
    res.redirect('/logout');
    return;
  }
  res.setHeader('Content-Type', 'application/json');
  // remove old lunches
  Lunch.find({when: { $lt: Date.now() }}).remove().exec(); 

  Lunch.findOne({when: { $gt: Date.now() }}, (err, lunch) => {
    console.log('lunch: ',err, lunch);
    if (!err) {
      Order.findOne({user: req.user.email}, (err, order) => {
        console.log(order);
        if (!err) {
          const ret = {};
          if (lunch !== null) {
            ret['when'] = lunch.when;
          }

          if (order !== null && order.lunch.equals(lunch._id)) {
            console.log('order found');
          }
          else {
            order = new Order({user: req.user.email, lunch: lunch});
          }
          res.send(JSON.stringify(Object.assign({}, ret, order._doc)));
        }
        else {
          res.send(JSON.stringify({err: err}));
        }
      });
    } else {
      res.send(JSON.stringify({err: err}));
    }
  });
});

app.get('/api/receipt', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  Lunch.findOne({when: { $gt: Date.now() }}, (err, lunch) => {
    if (!err) {
      Order.find({lunch: lunch._id}, (err, orders) => {
        var numShared = 0;
        orders.map((o) => {
          console.log(o, numShared);
          if (o.shared) {
            numShared ++;
          }
        });
        Dish.find({available: false, shared: { $lte: numShared }}, (err, dishes) => {
          if (err) {
            res.send(JSON.stringify({err: err}));
          } else {
            res.send(JSON.stringify({numShared, orders, dishes}));
          }
        });
      });
    }
    else {
      res.send(JSON.stringify({err: err}));
    }
  });
});

app.post('/api/order', (req, res) => {
  console.log(req.user);
  Order.findOneAndUpdate({user: req.user.email}, 
    { shared: req.body.shared, lunch: req.body.lunch, dishes: req.body.orders, updated: Date.now() }, 
    { new: true, upsert: true },
    (err, order) => {
      if (err) {
        console.log(err);
        res.send(JSON.stringify({err: err}));
      }
      else {
        res.send(JSON.stringify(order));
      }
    }
  );
});

app.post('/api/lunch', (req, res) => {
  Lunch.create({user: req.user.email, when: req.body.when}, (err, lunch) => {
    if (!err) {
      res.send(JSON.stringify({lunch:lunch}));
    }
    else {
      res.send(JSON.stringify({err: err}));
    }
  });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
});

app.set('port', process.env.PORT || 8080);
app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
