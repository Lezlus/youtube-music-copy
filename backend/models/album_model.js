const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Song = require('../models/song_model');

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


const albumSchema = new Schema({
  name: {type: String, required: true, maxLength: 100},
  songs: [{type: mongoose.Schema.Types.ObjectId, ref: "Song"}],
  songsAmount: {type: Number, required: false, default: 0},
  totalDuration: {type: Number, required: false, default: 0},
  typeItem: {type: String, required: false, default: "Album"},
  artist: {type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true},
  releaseYear: {type: String, required: false},
  image: {type: String, required: false}, 
}, {
  timestamps: true,
});

albumSchema.pre('save', function(next) {
  if (this.isNew) {
    getSongTotalDuration(this.songs)
      .then(duration => {
        console.log(duration)
        this.totalDuration = duration;
        next();
      })
    console.log("Changed the totalDuration of album")
  } else {
    next();
  }
});

const Album = mongoose.model("Album", albumSchema);
module.exports = Album;