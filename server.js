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

const nodemailer = require('nodemailer');

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

          if (order !== null && lunch !== null && order.lunch.equals(lunch._id)) {
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
  Lunch.findOne().sort('-when').exec((err, lunch) => {
    if (!err) {
      if (lunch !== null) {
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
              res.send(JSON.stringify({numShared, orders, dishes, lunch}));
            }
          });
        });
      } else {
        res.send(JSON.stringify({err: 'no lunch'}));
      }
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

const informSubscribers = (subscribers) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'qcrilunch@gmail.com',
      pass: 'qcri1234'
    }
  });


  User.find({}, 'email', (err, users) => {
    if (!err) {
      var subscribers = "";
      for (var user of users) {
        subscribers = subscribers.concat(user.email + ";");
      }
      console.log(subscribers);
      const mailOptions = {
        from: '"QCRI Lunch" <lunch@qcrilunch.com>',
        to: subscribers,
        subject: 'A lunch is created, calling for subscribers',
        text: 'Please go to http://qcrilunch.herokuapp.com to subscribe lunch',
        html: '<p><a href="http://qcrilunch.herokuapp.com">QCRI Lunch App</a></p>'
      };
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          return console.log(err);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
      });
    } else {
      console.log(err);
    }
  });
}

app.post('/api/lunch', (req, res) => {
  const when = req.body.when;
  Lunch.create({user: req.user.email, when: when}, (err, lunch) => {
    if (!err) {
      informSubscribers('yzhang@hbku.edu.qa');
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
