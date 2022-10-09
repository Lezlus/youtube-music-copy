const express = require('express');
const libraryRouter = express.Router();
const passport = require('passport');
const passportConfig = require("../passport");
const JWT = require('jsonwebtoken');
const Library = require("../models/library_model");
const User = require('../models/user_model');


libraryRouter.get("/", passport.authenticate("jwt", {session: false}), (req, res) => {
  User.findById(req.user._id)
    .then(user => {
      Library.findById(user.library)
        .then(library => {
          res.status(200).json({library: library, authenticated: true, message: {msgBody: "Retrieved your library", msgError: false}});
        })
        .catch(err => res.status(500).json("Error: " + err))
    })
    .catch(err => {
      res.status(500).json({message: {msgBody: "Error has occured probably not registered or logged in. " + err, msgError: true}});
    })
  // User.findById({_id: req.user._id}).populate("library").exec((err, user) => {
  //   if (err) {
  //     res.status(500).json({message: {msgBody: "Error has occured", msgError: true}});
  //   } else {
  //     res.status(200).json({library: user.library, authenticated: true, message: {msgBody: "Retrieved your library", msgError: false}});
  //   }
  // })
});

libraryRouter.get("/populated-library", passport.authenticate("jwt", {session: false}), (req, res) => {
  User.findById(req.user._id)
    .then(user => {
      Library.findById(user.library).populate({path: "playlists", populate: {path: "owner"}}).populate({path: "songs", populate: {path: "artist"}}).populate({path: "albums", populate: {path: "artist"}}).populate('artists').exec((err, library) => {
        if (err) {
          res.status(500).json("Error: " + err)
        } else {
          res.status(200).json({library: library, authenticated: true, message: {msgBody: "Retrieved your library", msgError: false}});
        }
      })
    })
    .catch(err => {
      res.status(500).json({message: {msgBody: "Error has occured probably not registered or logged in. " + err, msgError: true}});
    })
  // User.findById({_id: req.user._id}).populate("library").exec((err, user) => {
  //   if (err) {
  //     res.status(500).json({message: {msgBody: "Error has occured", msgError: true}});
  //   } else {
  //     res.status(200).json({library: user.library, authenticated: true, message: {msgBody: "Retrieved your library", msgError: false}});
  //   }
  // })
});

module.exports = libraryRouter;