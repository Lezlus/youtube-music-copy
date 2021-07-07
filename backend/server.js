const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true});
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established succesfully")
})

const playlistsRouter = require("./routes/playlist");
const songsRouter = require('./routes/song');

app.use('/songs', songsRouter);
app.use('/playlists', playlistsRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
})