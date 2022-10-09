const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const artistSchema = new Schema({
  name: {type: String, required: true, maxLength: 100},
  songs: [{type: mongoose.Schema.Types.ObjectId, required: false, ref: "Song"}],
  albums: [{type: mongoose.Schema.Types.ObjectId, required: false, ref: "Album"}],
  description: {type: String, required: false, maxLength: 300, default: ""},
  image: {type: String, required: false},
}, {
  timestamps: true,
});

const Artist = mongoose.model("Artist", artistSchema);
module.exports = Artist;