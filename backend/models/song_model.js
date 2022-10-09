const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const songSchema = new Schema({
  title: {type: String, required: true},
  artist: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "Artist"},
  duration: {type: String, required: true},
  durationSecs: {type: Number, required: true},
  typeItem: {type: String, default: "Song"},
  image: {type: String, required: true},
  audioFile: {type: String, required: true},
  album: {type: mongoose.Schema.Types.ObjectId, required: false, ref: "Album", default: null}
}, {
  timestamps: true,
});

const Song = mongoose.model("Song", songSchema);

module.exports = Song;