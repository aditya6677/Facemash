var express = require('express');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var handlebars = require('express-handlebars');
var path = require('path');
var	fs = require('fs');
var bp = require('body-parser');
var multer  = require('multer')
var app = express();

var db = require('./database');
var	photos = db.photos;
var	users = db.users;
//require('./routes')(app);

app.engine('html', handlebars({
		defaultLayout: 'main',
		extname: ".html",
		layoutsDir: __dirname + '/views/layouts'
	}));
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded());

passport.use(new Strategy({
    clientID: '1398282383558395',
    clientSecret: '',
    callbackURL: 'http://localhost:7676/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)']
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

app.get('/',require('connect-ensure-login').ensureLoggedIn(),
  function(req, res) {
		var gen=req.user.gender;
		var ngen=gen.charAt(0).toUpperCase()+gen.substring(1,gen.length);
		photos.find({}, function(err, saaripic){
			users.find({ip: req.ip}, function(err, u){
				var krdia = [];
				if(u.length == 1){
					krdia = u[0].votes;
				}
				var nakia = saaripic.filter(function(photo){
					return krdia.indexOf(photo._id) == -1;
				});
				var showpic = null;
				if(nakia.length > 0){
					showpic = nakia[Math.floor(Math.random()*nakia.length)];
				}
				var gen=req.user.gender;
				var ngen=gen.charAt(0).toUpperCase()+gen.substring(1,gen.length);
				saaripic.sort(function(p1, p2){
					return (p2.likes - p2.dislikes) - (p1.likes - p1.dislikes);
				});
				res.render('home', { photo: showpic, user : req.user, mg:ngen, standings: saaripic});
			});
		});

  });

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/login/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
	  req.logout();
	  res.redirect('/login');
	});

app.get('/jsondata',require('connect-ensure-login').ensureLoggedIn(),function(req,res){
	res.send(req.user);
});

app.get('/upload',require('connect-ensure-login').ensureLoggedIn(),function(req,res){

		var gen=req.user.gender;
		var ngen=gen.charAt(0).toUpperCase()+gen.substring(1,gen.length);
		photos.find({}, function(err, saaripic){
			users.find({ip: req.ip}, function(err, u){
				var krdia = [];
				if(u.length == 1){
					krdia = u[0].votes;
				}
				var nakia = saaripic.filter(function(photo){
					return krdia.indexOf(photo._id) == -1;
				});
				var showpic = null;
				if(nakia.length > 0){
					showpic = nakia[Math.floor(Math.random()*nakia.length)];
				}
				var gen=req.user.gender;
				var ngen=gen.charAt(0).toUpperCase()+gen.substring(1,gen.length);
				saaripic.sort(function(p1, p2){
					return (p2.likes - p2.dislikes) - (p1.likes - p1.dislikes);
				});
				res.render('upload', { photo: showpic, user : req.user, mg:ngen, standings: saaripic});
			});
		});

  });

var storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './public/photos')
	},
	filename: function(req, file, callback) {
		callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
	}
});

app.post('/upload', function(req, res) {
	var upload = multer({
		storage: storage,
		fileFilter: function(req, file, callback) {
			var ext = path.extname(file.originalname)
			if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
				return callback(res.end('Only images are allowed'), null)
			}
			callback(null, true)
		}
	}).single('file');
	upload(req, res, function(err) {
    var gname=req.body.uname;
      photos.insert({
          name: req.file.filename,
          naam: gname,
          likes: 0,
          dislikes: 0
        });
  res.send('file uploaded');
  });
});

app.post('*', function(req, res, next){
		users.insert({
			ip: req.ip,
			votes: []
		}, function(){
			next();
		});

	});

app.post('/nothot', vote);
app.post('/hot', vote);
function vote(req, res){
  	var what = {
  			'/nothot': {dislikes:1},
  			'/hot': {likes:1}
  	};
  photos.find({ name: req.body.photo }, function(err, found){
  	if(found.length == 1){
  				photos.update(found[0], {$inc : what[req.path]});
  				users.update({ip: req.ip}, { $addToSet: { votes: found[0]._id}}, function(){
  				res.redirect('/');
  				});
  	}
  	else{
  				res.redirect('/');
  			}
  		});
  	}

app.listen(7676);
