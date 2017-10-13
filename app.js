var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var path = require('path');
var http = require('http');
var multer = require('multer');

var config = require('./config/environment');
var userAuth = require('./config/passport');
var port = 3000;
var app = express();
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/hacker_weekend', {
  useMongoClient: true
});
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './assets/images');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + '.jpg');
  }
});
var upload = multer({ storage: storage });

// Set app vairables.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('port', process.env.PORT || port);


// Setup middlewares for the app
app.use(express.static(path.join(__dirname, 'assets')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: '0nly a hack3r can r3ad th12',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.locals.appName = config.appName;
app.use((req, res, next)=>{
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash('error');
  res.locals.infos = req.flash('info');
  next();
});


// Get the routes
var routes = require('./routes');
app.get('/', routes.index);
app.get('/users/login', routes.users.login);
app.post('/users/login', passport.authenticate('login', {
  successRedirect: '/',
  failureRedirect: '/users/login',
  failureFlash: true
}));
app.get('/users/signup', routes.users.signup);
app.post('/users/signup', routes.users.register, passport.authenticate('login', {
  successRedirect: '/users',
  failureRedirect: '/users/signup',
  failureFlash: true
}));
// Authenticate all the other routes (protected areas)
// app.use(function(req, res, next){
//   if (req.isAuthenticated()){
//     next();
//   } else {
//     res.redirect('/users/login');
//   }
// });
app.get('/users/logout', routes.users.logout);
app.get('/users', routes.users.index);
app.get('/users/:username', routes.users.user);
app.get('/users/:username/edit', routes.users.edit);
app.post('/users/:username/edit', upload.single('profile'), routes.users.editProfile);


// Hacks
app.get('/hacks', routes.hacks.index);
app.get('/hacks/start', routes.hacks.start);
app.post('/hacks/start', routes.hacks.registerHack);
app.get('/hacks/:slug/', routes.hacks.hack);
app.post('/hacks/:slug/editForm1', routes.hacks.editForm1);
app.get('/hacks/:slug/chatroom', routes.hacks.chatroom);

// Start the app server
var server = http.createServer(app);
server.listen(app.get('port'), ()=>{
  console.log('Server is running on %s port %s', server.address().address, server.address().port);
});
