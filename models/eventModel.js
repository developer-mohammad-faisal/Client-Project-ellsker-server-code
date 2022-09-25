const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
	sender: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	content: {
		type: String,
		required: true,
	},
	createdTime: {
		type: Date,
		default: Date.now,
	},
});

const eventSchema = mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	date: {
		type: Date,
		required: false,
	},
	location: {
		type: String,
		required: true,
	},
	members: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	],
	messages: [messageSchema],
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
