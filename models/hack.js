var mongoose = require('mongoose');

var Hack = mongoose.Schema({
  hackName: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
  description: { type: String },
  admin: { type: String },
  team: { type: Array },
  codeFiles: { type: Array},
  startDate: { type: Date, default: Date.now },
  stars: { type: Number }
});

module.exports = mongoose.model('Hacks', Hack);
