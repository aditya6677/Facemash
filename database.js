var demodb = require('nedb');
var	fs = require('fs');
var photos = new demodb({ filename: __dirname + '/data/photos', autoload: true });
var	users = new demodb({ filename: __dirname + '/data/users', autoload: true });
photos.ensureIndex({fieldName: 'name', unique: true});
users.ensureIndex({fieldName: 'ip', unique: true});
var alldpics = fs.readdirSync(__dirname + '/public/photos');
alldpics.forEach(function(photo){
	photos.insert({
		name: photo,
		likes: 0,
		dislikes: 0
	});
});

module.exports = {
	photos: photos,
	users: users
};
