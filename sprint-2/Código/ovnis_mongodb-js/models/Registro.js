const mongoose = require('mongoose');

const RegistroSchema = new mongoose.Schema({
	date: {type: String},
	day: {type: Number},
	month: {type: Number},
	year: {type: Number},
	weekday: {type: Number},
	time: {type: String},
	city: {type: String},
	state: {type: String},
	country: {type: String},
	shape: {type: String}
});

const Registro = mongoose.model('Registro', RegistroSchema);
module.exports = Registro;