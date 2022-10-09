const router = require('express').Router();
const Song = require('../models/song_model');

router.route('/:searchQuery').get((req, res) => {
  Song.find({title: {$regex: new RegExp(req.params.searchQuery), $options: 'i'}}).populate('artist').exec((err, songs) => {
    if (err) {
      res.status(500).json("Error: " + err)
    } else {
      res.status(200).json(songs);
    }
  })
})

module.exports = router;