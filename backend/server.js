const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:3000",
  methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established succesfully")
})

const playlistsRouter = require("./routes/playlist");
const songsRouter = require('./routes/song');
const userRouter = require('./routes/user');
const libraryRouter = require('./routes/library');
const albumRouter = require('./routes/album');
const artistRouter = require('./routes/artist');
const searchRouter = require('./routes/search');

app.use('/songs', songsRouter);
app.use('/playlists', playlistsRouter);
app.use('/user', userRouter);
app.use('/library', libraryRouter);
app.use('/albums', albumRouter);
app.use('/artists', artistRouter);
app.use('/search', searchRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
})