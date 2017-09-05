var demodb = require('nedb');
var	fs = require('fs');
var photos = new demodb({ filename: __dirname + '/data/photos', autoload: true });
var	users = new demodb({ filename: __dirname + '/data/users', autoload: true });
photos.ensureIndex({fieldName: 'name', unique: true});
users.ensureIndex({fieldName: 'ip', unique: true});
module.exports = {
	photos: photos,
	users: users
};
