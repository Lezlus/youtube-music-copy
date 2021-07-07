const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const songSchema = new Schema({
  title: {type: String, required: true},
  artist: {type: String, required: true},
  duration: {type: String, required: true},
  durationSecs: {type: Number, required: false},
  typeItem: {type: String, required: true},
  image: {type: String, required: true},
  audioFile: {type: String, required: true},
}, {
  timestamps: true,
});

const Song = mongoose.model("Song", songSchema);

module.exports = Song;