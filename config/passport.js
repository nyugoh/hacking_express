var passport = require('passport');
var strategy = require('passport-local').Strategy;
var User = require('../models/users');

module.exports = function(){
  var users = {
    foo: {
      username: 'foo',
      password: 'bar',
      id: 1
    },
    bar: {
      username: 'bar',
      password: 'foo',
      id: 2
    }
  }

  passport.use('basic', new strategy((username, password, done)=>{
    var user = users[username];
    if (user == null) return done(null, false, { message: 'User does\'t exists.' });
    if (user.password !== password) return done(null, false, { message: 'Incorrect password' });
    return done(null, user);

  }));

  passport.use('login', new strategy(function(username, password, done){
    User.findOne({ username: username}, (e, user)=>{
      if (e) return done(e);
      if (!user) return done(null, false, { message: 'User does\'t exists.' });

      user.checkPassword(password, (e, isMatch)=>{
        if (e) return done(e);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Username or password is incorrect.' });
        }
      });
    });
  }));

  // Takes a user and returns an id
  passport.serializeUser((user, done)=>{
    return done(null, user.id);
  });

  // Takes an id and converts it to a user
  passport.deserializeUser((id, done)=>{
      User.findById(id, (e, user)=>{
        if (e) return done(e)
        return done(e, user);
      });
  });

};
