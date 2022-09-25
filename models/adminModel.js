const mongoose = require('mongoose');

const adminSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	username: {
		type: String,
		required: true,
		unique:[true,"this user name is already exist"]
	},
	password: {
		type: String,
		required: false,
	},
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
