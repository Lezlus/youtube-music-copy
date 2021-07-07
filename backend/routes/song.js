const router = require('express').Router();
let Song = require('../models/song_model');

router.route('/').get((req, res) => {
  Song.find()
    .then(songs => res.json(songs))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const title = req.body.title;
  const artist = req.body.artist;
  const duration = req.body.duration;
  const durationSecs = Number(req.body.durationSecs);
  const typeItem = req.body.typeItem;
  const image = req.body.image;
  const audioFile = req.body.audioFile;

  const newSong = new Song({
    title,
    artist,
    duration,
    durationSecs,
    typeItem,
    image,
    audioFile,
  });

  newSong.save()
    .then(() => res.json("Song added: "))
    .catch(err => res.status(400).json("Error: " + err));

});

router.route('/:id').get((req, res) => {
  Song.findById(req.params.id)
    .then(song => res.json(song))
    .catch(err => res.status(400).json('Error: ' + err));
});


module.exports = router;