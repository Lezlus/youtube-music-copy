const router = require('express').Router();
const Song = require('../models/song_model');
const User = require("../models/user_model");
const Library = require("../models/library_model");
const Playlist = require("../models/playlist_model");
const passport = require('passport');
const mongoose = require('mongoose');

const checkIfSongHasArtist = (songsArray, artistId) => {
  for (let i = 0; i<songsArray.length; i++) {
    if (songsArray[i].artist.toString() === artistId) {
      return true;
    }
  }
  return false;
}




// Get all songs
router.route('/').get((req, res) => {
  Song.find().populate('artist').exec((err, song) => {
    if (err) {
      res.status(500).json("Error: " + err)
    } else {
      res.status(200).json(song);
    }
  });
});

// Create a song
router.route('/add').post((req, res) => {
  const title = req.body.title;
  const artist = req.body.artist;
  const duration = req.body.duration;
  const durationSecs = Number(req.body.durationSecs);
  const image = req.body.image;
  const audioFile = req.body.audioFile;

  const newSong = new Song({
    title,
    artist,
    duration,
    durationSecs,
    image,
    audioFile,
  });

  newSong.save()
    .then(() => res.json("Song added: "))
    .catch(err => res.status(400).json("Error: " + err));

});

// Get a specific song by id
router.route('/:id').get((req, res) => {
  Song.findById(req.params.id)
    .then(song => res.json(song))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Add a song to your library
router.route('/add-to-library/:id').get(passport.authenticate("jwt", {session: false}), (req, res) => {
  Song.findById(req.params.id)
    .then(song => {
      User.findById(req.user._id)
        .then(user => {
          Library.findById(user.library)
            .then(library => {
              library.songs.push(song);
              if (!library.artists.includes(song.artist._id)) {
                console.log("adding artist from adding song")
                library.artists.push(song.artist);
              }
              library.save();
            })
            .catch(err => {
              console.log(err);
            })
        })
        .catch(err => {
          console.log(err);
        })
      res.json({msg: "Added a song to your library", authenticated: true});
    })
    .catch(err => {
      console.log(err);
    })
});

router.route('/add-to-liked-playlist/:songId').get(passport.authenticate("jwt", {session: false}), (req, res) => {
  Library.findOne({owner: req.user})
    .then(library => {
      Playlist.findOne({owner: req.user, name: "Your Likes"})
        .then(playlist => {
          Song.findById(req.params.songId)
            .then(song => {
              playlist.songs.push(song);
              playlist.totalDuration += song.durationSecs;
              playlist.songsAmount += 1;
              let songAddedToLibrary = false;
              if (!library.songs.includes(song._id)) {
                console.log("liked song added to library")
                library.songs.push(song);
                songAddedToLibrary = true;
              }
              if (!library.artists.includes(song.artist)) {
                console.log("liked song artist added to library")
                library.artists.push(song.artist);
              }
              playlist.save();
              library.save();
              res.status(200).json({msg: "Song added to liked playlist", authenticated: true, songAddedToLibrary: songAddedToLibrary})
            })
        })
    })
});



// Add a song to a specific playlist in your library
// Remember to add an auth check to make sure the playlist belongs to thw correct user
router.route('/add-to-playlist/:playlistId/:songId').get(passport.authenticate("jwt", {session: false}), (req, res) => {
  Song.findById(req.params.songId)
    .then(song => {
      Playlist.findByIdAndUpdate(req.params.playlistId, {$push: {songs: song}}, {new: true}).exec((err, playlist) => {
        if (err) {
          res.status(500).json("Error: " + err)
        } else {
          playlist.totalDuration += song.durationSecs;
          playlist.songsAmount += 1;
          playlist.save();
          res.json({msg: "Song added to your playlist", authenticated: true, songs: playlist.songs});
        }
      })
    })
    .catch(err => {
      console.log(err);
    })
});

// Remove song from playlist
router.route('/remove-from-playlist/:playlistId/:songId').post(passport.authenticate("jwt", {session: false}), (req, res) => {

  let removingDuplicate = req.body.removingDuplicate;

  Song.findById(req.params.songId)
    .then(song => {
      let songId = mongoose.Types.ObjectId(song._id);
      if (!removingDuplicate) {
        Playlist.findByIdAndUpdate(req.params.playlistId, {$pull: {songs: song._id}}, {new: true}).exec((err, playlist) => {
          if (err) {
            res.status(500).json("Error: " + err)
          } else {
            playlist.totalDuration -= song.durationSecs;
            playlist.songsAmount -= 1;
            playlist.save();
            res.json({msg: "Song removed from your playlist", authenticated: true, songs: playlist.songs});
          }
        })
      } else {
        Playlist.findById(req.params.playlistId)
          .then(playlist => {
            let songsArray = [...playlist.songs];
            let songIndex = songsArray.indexOf(song._id);
            songsArray.splice(songIndex, 1);
            playlist.songs = songsArray;
            playlist.save()
            res.json({msg: "Duplicate Song removed from your playlist", authenticated: true, songs: songsArray});
          })
      }
    })
    .catch(err => {
      console.log(err);
    });
});

// Remove a song from your library
router.route('/remove-from-library/:songId').get(passport.authenticate("jwt", {session: false}), (req, res) => {
  Song.findById(req.params.songId)
    .then(song => {
      User.findById(req.user._id)
        .then(user => {
          Library.findByIdAndUpdate(user.library, {$pull: {songs: song._id}}).exec((err, library) => {
            if (err) {
              res.status(500).json("Error: " + err)
            } else {
              Library.findById(user.library).populate({path: 'songs', model: 'Song'}).exec((err, updatedLibrary) => {
                if (err) {
                  res.status(500).json("Error: " + err)
                } else {
                  const artistInSong = checkIfSongHasArtist(updatedLibrary.songs, song.artist.toString());
                  if (!artistInSong) {
                    updatedLibrary.artists.pull(song.artist);
                    updatedLibrary.save();
                  }
                  res.status(200).json({msg: "Song removed from library", authenticated: true, libraryData: updatedLibrary, artistInSong: artistInSong})
                }
              })
            }
          })
        })
    })
});

module.exports = router;