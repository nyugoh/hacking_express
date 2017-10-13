var express = require('express');
var User = require('../models/users');
var userAuth = require('../config/passport');
var passport = require('passport');
var fs = require('fs');
var router = express.Router();

userAuth();
// Attach to every res
router.use((req, res, next)=>{
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash('error');
  res.locals.infos = req.flash('info');
  next();
});

// Show hackers info
module.exports.index = function(req, res, next){
  User.find()
  .sort({ createdOn: "descending" })
  .exec((e, users)=>{
    if (e) return next(e);
    res.render('users', { users: users });
  });
};

// SHow only one hacker
module.exports.user = function(req, res, next){
  User.findOne({ username: req.params.username}, (e, user)=>{
    if (e) return next(e);
    if (!user) return next(404);
    res.render('user', { user: user });
  });
};


module.exports.login = function(req, res, next){
  if (req.isAuthenticated()){
    res.redirect('/users/'+req.user.username);
  } else {
    res.render('login');
  }
};

module.exports.logout =  function(req, res, next){
  req.logout();
  res.redirect('/users/login');
};

module.exports.signup = function(req, res, next){
  if (req.isAuthenticated()){
    res.redirect('/users/'+req.user.username+'/edit');
  } else {
    res.render('signup');
  }
};

module.exports.register = function(req, res, next){
  // Check if user exists
  var username = req.body.username;
  var password = req.body.password;
  var fullName = req.body.fullName;
  var email = req.body.email;
  var bioInfo = req.body.bioInfo;

  User.findOne( {username: username }, (e, user)=>{
    if (e) return next(e);
    if (user) {
      req.flash('error', 'User name already exists.');
      return res.redirect('/users/signup');
    }

    var newUser = new User({
      username: username,
      fullName: fullName,
      password: password,
      displayName: username,
      meta:{
        bioInfo: bioInfo,
        email: email
      }
    });
    newUser.save(function(error, user, rows){
      if (error) return next(error);
      if (rows === 1) next();
    });
  });
};


module.exports.edit = function(req, res, next){
  User.findOne({username: req.params.username}, (e, user)=>{
    if (e) return next(e);
    res.render('profile', { user:user });
  });
}

module.exports.editProfile = function(req, res, next){
  var profile = 'linux.jpg';
  if (req.file.filename !== '') {
    profile = req.file.filename;
  }
  console.log(req.file);
  req.user.fullName = req.body.fullName;
  req.user.username = req.params.username;
  req.user.password = req.user.password;
  req.user.meta = {
      themeColor: req.body.themeColor,
      gitAccount: req.body.gitAccount,
      twitterAccount: req.body.twitterAccount,
      email: req.body.email,
      bioInfo: req.body.bioInfo,
      profile: profile
    };
    req.user.points = 5;
    req.user.country = req.body.country;
    req.user.fullName = req.body.fullName;
    req.user.lastUpdate = new Date().now;
    req.user.save((e)=>{
      if (e){
        next('profile not updated, ' + e);
      } else {
        res.redirect('/users/'+ req.params.username);
      }
    });

}
