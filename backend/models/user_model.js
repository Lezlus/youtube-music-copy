const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Library = require('../models/library_model');

const UserSchema = new mongoose.Schema({
  username: {type: String, required: true, min: 6, max: 15},
  password: {type: String, required: true},
  library: {type: mongoose.Schema.Types.ObjectId, ref: "Library"}
}, {
  timestamps: true,
});

UserSchema.pre('save', function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  if (this.isNew) {
    console.log("A new user is being prepped to save")
    const library = new Library({owner: this});
    library.save(err => {
      if (err) {
        console.log(err);
        return next();
      } 
    });
    console.log("Adding Library to user");
    this.library = library;
    bcrypt.hash(this.password, 10, (err, passwordHash) => {
      if (err) {
        return next(err);
      }
      console.log(this.password)
      console.log("Created a hash of your password " + passwordHash);
      this.password = passwordHash;
      next();
    });
  }
});

UserSchema.methods.comparePassword = function(password, cb) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) {
      return cb(err);
    } else {
        if (!isMatch) {
          return cb(null, isMatch);
        }
        return cb(null, this);
    }

  });
}

const User = mongoose.model("User", UserSchema);

module.exports = User;