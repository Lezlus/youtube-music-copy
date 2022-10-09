const mongoose = require('mongoose');
const Song = require('../models/song_model');
const Schema = mongoose.Schema;

const songDataArrayPromise = (songsArray) => {
  let promiseDataSongsArray = [];
  for (let i = 0; i < songsArray.length; i++) {
    let currentSongId = songsArray[i];
    promiseDataSongsArray.push(
      Song.findById(currentSongId)
        .then(song => {
          return song;
        })
        .catch(err => {
          console.log(err);
        })
    )
  }
  return promiseDataSongsArray;
}

const getSongTotalDuration = async (songsArray) => {
  const songDataArray = await Promise.all(songDataArrayPromise(songsArray));
  let totalDuration = 0;
  songDataArray.map(songData => {
    totalDuration = totalDuration + songData.durationSecs;
  });
  return totalDuration;
}

const playlistSchema = new Schema({
  name: {type: String, required: true, maxLength: 100},
  owner: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, default: null},
  songs: [{type: mongoose.Schema.Types.ObjectId, ref: "Song"}],
  songsAmount: {type: Number, required: false, default: 0},
  totalDuration: {type: Number, required: false, default: 0},
  typeItem: {type: String, required: false, default: "Playlist"},
  public: {type: Boolean, require: true},
  image: {type: String, required: false}, 

}, {
  timestamps: true,
});

playlistSchema.pre("save", function(next) {
  console.log(`A playlist named ${this.name} is being prepped to save`);
  if (this.songs.length) {
    getSongTotalDuration(this.songs)
      .then(duration => {
        if (this.totalDuration !== duration) {
          this.songsAmount = this.songs.length
          this.totalDuration = duration;
        }
        next();
      })
  } else {
    next();
  }
})

const Playlist = mongoose.model("Playlist", playlistSchema);
module.exports = Playlist;