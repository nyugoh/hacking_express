var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

var userSchema = Schema({
    fullName: { type: String, required: true, unique: true },
    username: { type: String, unique: true, required: true },
    displayName: { type: String},
    password: { type: String },
    country: { type: String, default: 'Kenya' },
    coder: { type: Array, default: [0, 0] },
    points: { type: Number, default: 0 },
    meta: {
      bioInfo: { type:String },
      themeColor: { type: String, default: '#34ea4e'},
      gitAccount: { type: String },
      twitterAccount: { type: String },
      email: { type: String },
      profile: { type: String }
    },
    createdOn: { type: Date, default: Date.now },
    lastUpdate: { type: Date, default: Date.now }
});


userSchema.pre('save', function(done){
  var user = this;
  if (!user.isModified('password')) return done()

  bcrypt.hash(user.password, 10, function(e, hashedPassword){
    if (e) return done(e);
    user.password = hashedPassword;
    return done();
  });
});

userSchema.methods.checkPassword = function(guess, done) {
 bcrypt.compare(guess, this.password, function(err, isMatch) {
   done(err, isMatch);
 });
};

// Add methods to the schema
userSchema.methods.name = function(){
  return this.username || this.displayName; // Return the username otherwise the name
};

var User = mongoose.model('User', userSchema);

module.exports = User;
