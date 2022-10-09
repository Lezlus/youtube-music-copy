const express = require('express');
const router = require('express').Router();
const playlistRouter = express.Router();
const Playlist = require('../models/playlist_model');
const User = require("../models/user_model");
const Library = require("../models/library_model");
const passport = require('passport');


// Finds all playlists with public field set to true
router.route('/').get((req, res) => {
  Playlist.find({public: true}).populate('owner').exec((err, playlists) => {
    if (err) {
      res.status(400).json('Error: ' + err)
    } else {
      res.json(playlists)
    }
  })
});

// Finds your specific your likes playlist
router.route('/find-your-likes').get(passport.authenticate("jwt", {session: false}), (req, res) => {
  Playlist.find({owner: req.user, name: "Your Likes"})
    .then(playlist => res.json(playlist[0]))
    .catch(err => res.status(400).json("Erro: " + err));
});

// Creating a playlist
router.route("/add").post(passport.authenticate("jwt", {session: false}), (req, res) => {
  const name = req.body.name;
  const owner = req.user;
  const songs = req.body.songs;
  const songsAmount = songs.length;
  const public = req.body.public;

  const newPlaylist = new Playlist({
    name: name,
    owner: owner,
    songs: songs,
    songsAmount: songsAmount,
    public: public,
  });
  newPlaylist.save()
    .then(savedDoc => {
      User.findById(req.user._id)
        .then(user => {
          Library.findById(user.library)
            .then(library => {
              library.playlists.push(savedDoc);
              library.save();
            })
            .catch(err => {
              console.log(err);
            })
        })
        .catch(err => {
          console.log(err);
        })
      res.status(200).json({message: {msgBody: "Playlist Added", msgError: false}, authenticated: true, newPlaylist: savedDoc} );
    })
    .catch(err => res.status(400).json("Error: " + err));
});

// Getting a single playlist
router.route("/:id").get((req, res) => {
  Playlist.findById(req.params.id).populate({path: "songs", populate: {path: 'artist'}}).exec((err, playlist) => {
    if (err) {
      res.status(500).json("Error: " + err)
    } else {
      res.status(200).json(playlist);
    }
  })
});

// Adding a playlist to library
router.route("/add-to-library/:id").get(passport.authenticate("jwt", {session: false}), (req, res) => {
  Playlist.findById(req.params.id)
    .then(playlist => {
      User.findById(req.user._id)
        .then(user => {
          Library.findById(user.library.toString())
            .then(library => {
              library.playlists.push(playlist);
              library.save();
            })
            .catch(err => {
              console.log(err);
            })
        })
        .catch(err => {
          console.log(err);
        })
      res.json({msg: "Added a playlist to your library", authenticated: true});
    })
    .catch(err => {
      console.log(err);
    })
});

// Removing a playlist from your library
router.route("/remove-from-library/:id").get(passport.authenticate("jwt", {session: false}), (req, res) => {
  Playlist.findById(req.params.id)
    .then(playlist => {
      User.findById(req.user._id)
        .then(user => {
          Library.findById(user.library.toString())
            .then(library => {
              library.playlists.pull(playlist);
              library.save()
            })
        })
      res.json({msg: "Playlist removed from library", authenticated: true});
    })
});

// Adding a playlist to another playlist in your library
// What actaully happens is you just push the songs array to the playlist
// Edge case when you add to another playlist and the current playlist contains duplicates you need to ask weather to keep adding them or skip duplicates
router.route("/add-to-playlist/:migratePlaylistId/").post(passport.authenticate("jwt", {session: false}), (req, res) => {
  let songs = req.body.songs;
  let option = req.body.option;
  if (option === "Add Anyway") {
    Playlist.findByIdAndUpdate(req.params.migratePlaylistId, {$push: {songs: {$each: songs}}}, {new: true}).exec((err, playlist) => {
      if (err) {
        res.status(500).json("Error: " + err)
      }
      else {
        playlist.songsAmount += songs.length;
        playlist.save()
        res.json({msg: "Playlist added to another playlist, added all", authenticated: true, songs: playlist.songs})      
      }

    })
  } else {
    Playlist.findByIdAndUpdate(req.params.migratePlaylistId, {$addToSet: {songs: {$each: songs}}}, {new: true}).exec((err, playlist) => {
      if (err) {
        res.status(500).json("Error: " + err)
      } else {
        playlist.save()
        res.json({msg: "Playlist added to another playlist, skipped duplicates", authenticated: true, songs: playlist.songs})          
      }
    })
  }
});

// Delete a playlist from your library
router.route('/delete-playlist/:playlistId').get(passport.authenticate("jwt", {session: false}), (req, res) => {
  const id = req.params.playlistId
  User.findById(req.user._id)
    .then(user => {
      Library.findById(user.library.toString())
        .then(library => {
          // Pull ref to playlist in library
          library.playlists.pull(id);
          library.save();
        })
        .catch(err => {
          console.log(err)
        })
    })
    .catch(err => {
      console.log(err);
    })
  Playlist.findByIdAndDelete(id)
    .then(data => {
      if (!data) {
        res.status(404).send({message: `Cannot Delete with ${id}. Maybe id is wrong`})
      } else {
        res.send({
          message: "Playlist was deleted succesfuly!"
        })
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        message: `Could not delete playlist with id=${id}`
      })
    });
})

// Update the playlist
router.route('/update-playlist/:playlistId').put(passport.authenticate("jwt", {session: false}), (req, res) => {
  const id = req.params.playlistId;
  const updatedData = {name: req.body.name, public: req.body.public};

  Playlist.findByIdAndUpdate(id, updatedData)
    .then(data => {
      if (!data) {
        res.status(404).send({message: `Cannot update playlist with ${id}.`})
      } else {
        res.status(200).send({message: "Playlist was updated successfully"})
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).send({
        message: `Could not update playlist with id=${id}`
      })
    });
});

module.exports = router;