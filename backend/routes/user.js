const express = require('express');
const userRouter = express.Router();
const passport = require('passport');
const passportConfig = require("../passport");
const JWT = require('jsonwebtoken');
const User = require("../models/user_model");

const signToken = userID => {
  return JWT.sign({
    iss: "AurickKruger",
    sub: userID
  }, "AurickKruger", {expiresIn: "1h"})
}

userRouter.post("/register", (req, res) => {
  const {username, password} = req.body;
  User.findOne({username}, (err, user) => {
    if (err) {
      res.status(500).json({message: {msgBody: "Error has occured", msgError: true}});
    }
    if (user) {
      res.status(400).json({message: {msgBody: "Username is already taken", msgError: true}});
    } else {
      const newUser = new User({username, password});
      newUser.save(err => {
        if (err) {
          res.status(500).json({message: {msgBody: "Error has occured", msgError: true}});
        } else {
          res.status(201).json({message: {msgBody: "Account successfully created", msgError: false}});
        }
      });
    }
  })
});

userRouter.post("/login", passport.authenticate('local', {session: false}), (req, res) => {
  if (req.isAuthenticated()) {
    const {_id, username} = req.user; 
    const token = signToken(_id);
    res.cookie('access_token', token, {httpOnly: true, sameSite: true});
    res.status(200).json({isAuthenticated: true, user: {username}, userId: _id});
  }
});

userRouter.get('/logout', passport.authenticate('jwt', {session: false}), (req, res) => {
  res.clearCookie("access_token");
  res.json({user: {username: ""}, success: true});
});

userRouter.get('/authenticated', passport.authenticate('jwt', {session: false}), (req, res) => {
  const {username} = req.user;
  res.status(200).json({isAuthenticated: true, user: {username}, userInfo: req.user, userId: req.user._id});
});

module.exports = userRouter;