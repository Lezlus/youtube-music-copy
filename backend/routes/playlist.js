const router = require('express').Router();
let Playlist = require('../models/playlist_model');

router.route('/').get((req, res) => {
  Playlist.find()
    .then(playlists => res.json(playlists))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const name = req.body.name;
  const songs = req.body.songs;
  const songsAmount = Number(req.body.songsAmount);
  const totalDuration = Number(req.body.totalDuration);
  const typeItem = req.body.typeItem;

  const newPlaylist = new Playlist({
    name,
    songs,
    songsAmount,
    totalDuration,
    typeItem,
  });
  newPlaylist.save()
    .then(() => res.json("Playlist added: "))
    .catch(err => res.status(400).json("Error: " + err));
});

module.exports = router;