var Hack = require('../models/hack');
var User = require('../models/users');

// Show all hacks
module.exports.index = function(req, res, next){
    Hack.find()
    .sort({ startDate: 'descending' })
    .exec(function(e, hacks){
      if (e) return next(e);

      for (var hack in hacks) {
        User.find({ _id: hacks[hack].team }, function(e, team){
          if (e) return next(e);
          hacks[hack].team = team.username;
        });
      }
      // Get team members
      res.render('hacks/index', { hacks: hacks });
    });
};


// Register a new hacks
module.exports.start = function(req, res, next){
  res.render('hacks/start');
};

// Handle the registration
module.exports.registerHack = function(req, res, next){
  var hackName = req.body.hackName;
  var description = req.body.description;
  Hack.findOne({hackName: hackName}, function(e, hack){
    if (e) return next(e);
    if (hack) {
      req.flash('info', 'Hack name already taken...join the team');
      res.redirect('/hacks/start');
    }

    // Save the hack
    var newHack = new Hack({
      hackName: hackName,
      slug: req.body.slug,
      description: description,
      admin: req.user._id,
      team: [req.user._id],
      starts: 0,
      codeFiles: ['.gitignore', 'READMEMD']
    });

    newHack.save(function(e, hack, rows){
      if (e) return next(e);
      if (rows === 1) res.redirect('/hacks/'+ req.body.slug);
    });

  })
};

// Show information about a hack
module.exports.hack = function(req,res,next){
  Hack.findOne({ slug: req.params.slug}, function(e, hack){
    if (e) return next(e);

    var members;
    User.find({ '_id': { $in: hack.team }}, function(e, team){
      if (e) return next(e);
      console.log(team.username);;
    });
    console.log(members);
    res.render('hacks/hack', { hack: hack, team: members });
  });
};

module.exports.editForm1 = function(req, res, next){
  Hack.findOne({slug: req.params.slug}, function(e, hack){
    if (e) return next(e);
    hack.description = req.body.description;
    hack.save(function(e){
      if (e) return next(e);
      res.redirect('/hacks/'+ req.params.slug);
    });
  });
};

// Show the hack's chatroom
module.exports.chatroom = function(req,res,next){
  res.render('hacks/chatroom');
};
