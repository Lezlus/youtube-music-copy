const router = require('express').Router();
const Album = require('../models/album_model');
const User = require("../models/user_model");
const Library = require("../models/library_model");
const passport = require('passport');
const Artist = require('../models/artist_model');
const Song = require('../models/song_model');

// Get all artists
router.route('/').get((req, res) => {
  Artist.find()
    .then(artists => res.json(artists))
    .catch(err => res.status(400).json("Error " + err));
});

// Add an artist
router.route("/add").post((req, res) => {
  const newArtist = new Artist({name: req.body.name, songs: req.body.songs, albums: req.body.albums});
  newArtist.save()
    .then(() => res.json("Artist Added"))
    .catch(err => res.status(400).json("Error: " + err));
});

// Get a single artist
router.route("/:id").get((req, res) => {
  Artist.findById(req.params.id).populate("songs").populate('albums').exec((err, artist) => {
    // Check if artist has any albums, artist should have at least one song
    if (err) {
      res.status(500).json({message: {msgBody: "Error has occured " + err, msgError: true}});
    } else {
      res.status(200).json(artist)
    }
  })
});

module.exports = router;