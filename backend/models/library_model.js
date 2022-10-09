const mongoose = require('mongoose');
const Playlist = require('../models/playlist_model');

const LibrarySchema = new mongoose.Schema({
  owner: {type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: false},
  playlists: [{type: mongoose.Schema.Types.ObjectId, ref: "Playlist"}],
  albums: [{type: mongoose.Schema.Types.ObjectId, ref: "Album"}],
  songs: [{type: mongoose.Schema.Types.ObjectId, ref: "Song"}],
  artists: [{type: mongoose.Schema.Types.ObjectId, ref: "Artist"}]
}, {
  timestamps: true,
});

LibrarySchema.pre("save", function(next) {
  console.log("A Library is prepped to save with id " + this._id);
  console.log("The owner of this library has id" + this.owner.toString());
  // Only create a default liked playlist when the library is new
  if (this.isNew) {
    const playlist = new Playlist({name: "Your Likes", public: false, owner: this.owner});
    playlist.save(err => {
      if (err) {
        console.log(err);
        return next();
      }
    });
    console.log("Adding Auto Liked playlist to library");
    this.playlists.push(playlist);
  }
  next();
});


const Library = mongoose.model("Library", LibrarySchema);

module.exports = Library;