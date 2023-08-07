const mongoose  = require('mongoose');

const PlaceSchema = new mongoose.Schema({
    owner: {type:mongoose.Schema.Types.ObjectId, ref:'User'},
    title: String,
    address: String,
    description: String,
    photos: [String],
    extraInfo: String,
    checkin: Number,
    checkout: Number,
    maxGuests: Number
});

const Place = mongoose.model('Place', PlaceSchema);

module.exports = Place;