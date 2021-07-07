const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const playlistSchema = new Schema({
  name: {type: String, required: true, maxLength: 100},
  songs: {type: Array, required: false},
  songsAmount: {type: Number, required: false, default: 0},
  totalDuration: {type: Number, required: false, default: 0},
  typeItem: {type: String, required: false},

}, {
  timestamps: true,
});

const Playlist = mongoose.model("Playlist", playlistSchema);

module.exports = Playlist;