const express = require('express');
const router = require('express').Router();
const Album = require('../models/album_model');
const User = require("../models/user_model");
const Library = require("../models/library_model");
const Song = require('../models/song_model');
const passport = require('passport');



const checkIfSongHasArtist = (songsArray, artistId) => {
  for (let i = 0; i<songsArray.length; i++) {
    if (songsArray[i].artist.toString() === artistId) {
      return true;
    }
  }
  return false;
}

const createSongsOfIds = (songsArray) => {
  let songs = [];
  for (let i = 0; i<songsArray.length; i++) {
    songs.push(songsArray[i]._id);
  }
  return songs;
}


// Get all albums
router.route('/').get((req, res) => {
  Album.find().populate('artist').exec((err, albums) => {
    if (err) {
      res.status(400).json('Error: ' + err)
    } else {
      res.status(200).json(albums)
    }
  });
});

// Create an album
router.route("/add").post((req, res) => {
  // Here you can update the songsAmount, and totalDuration
  const songs = req.body.songs;
  let songsAmount = songs.length;
  let totalDuration = 0;
  for (let i = 0; i < songs.length; i++) {
    let currentSong = songs[i];
    Song.findById(currentSong)
      .then(song => {
        totalDuration += song.durationSecs;
      })
      .catch(err => {
        console.log(err);
        totalDuration = 0;
      })
  }

  const newAlbum = new Album({name: req.body.name, songs: req.body.songs, 
                              artist: req.body.artist, releaseYear: req.body.releaseYear, 
                            songsAmount: songsAmount, totalDuration: totalDuration,})
  newAlbum.save()
    .then(() => res.json("Album added"))
    .catch(err => res.status(400).json("Error: " + err));
})

// Get a single album
router.route('/:id').get((req, res) => {
  Album.findById(req.params.id).populate('songs').populate('artist').exec((err, album) => {
    if (err) {
      res.status(500).json("Error: " + err)
    } else {
      res.status(200).json(album);
    }
  })
});

// Add album to your library (Add corresponding artist to library as well)
router.route("/add-to-library/:id").get(passport.authenticate("jwt", {session: false}), (req, res) => {
  Album.findById(req.params.id)
    .then(album => {
      User.findById(req.user._id)
        .then(user => {
          Library.findByIdAndUpdate(user.library, {$addToSet: {songs: {$each: album.songs}}}, {new: true}).exec((err, library) => {
            if (err) {
              res.status(500).json("Error: " + err)
            } else {
              library.albums.push(album);
              if (!library.artists.includes(album.artist)) {
                console.log("Artist adding to library via adding album")
                library.artists.push(album.artist);
              }
              library.save()
              res.json({msg: "Added an album to your library", authenticated: true, updatedSongs: library.songs});
            } 
          })
        })
        .catch(err => {
          console.log(err);
        })
    })
    .catch(err => {
      console.log(err);
    })
});

// Remove album from your library (Remove corresponding album if no other album has the same artist)
router.route("/remove-from-library/:id").get(passport.authenticate("jwt", {session: false}), (req, res) => {
  Album.findById(req.params.id)
    .then(album => {
      User.findById(req.user._id)
        .then(user => {
          Library.findByIdAndUpdate(user.library, {$pull: {songs: {$in: album.songs}}}).exec((err, library) => {
            if (err) {
              res.status(500).json("Error: " + err)
            } else {
              Library.findById(user.library).populate({path: 'songs', model: 'Song'}).exec((err, updatedLibrary) => {
                if (err) {
                  res.status(500).json("Error: " + err)
                } else {
                  const artistInSong = checkIfSongHasArtist(updatedLibrary.songs, album.artist.toString());
                  if (!artistInSong) {
                    updatedLibrary.artists.pull(album.artist)
                  }
                  updatedLibrary.albums.pull(album);
                  updatedLibrary.save()
                  const songsArray = createSongsOfIds(updatedLibrary.songs)
                  res.status(200).json({msg: "Album removed from library", authenticated: true, updatedSongs: songsArray, artistInSong: artistInSong});
                }
              })
            }
          })
        })
    })
});

module.exports = router;