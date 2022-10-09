import {Howl, Howler} from 'howler';
import {shuffleArray, currentSongIsObject, createSongObj} from './utils/playerUtils';

var Player = function(playlist, reactObj) {
  this.playlist = playlist;
  this.index = 0;
  this.is_sliding = false;
  this.is_looped = false;
  this.reactObj = reactObj;
};

Player.prototype = {

  playPlaylist: function(songDataArray, index) {
    var self = this;
    let pos = typeof index === "number" ? index : 0;
    let songData = createSongObj(songDataArray);
    if (self.playlist.length > 1) {
      self.playlist[self.index].howl.stop();
    }
    self.playlist = songData;
    self.play(pos)
  },

  playSingleSong: function(songDataObj) {
    var self = this;
    let songData = createSongObj(songDataObj);
    if (self.playlist.length == 0) {
      self.playlist.push(songData);
      self.play()
    } else if (!currentSongIsObject(songData, self.playlist[self.index])) {
        self.playlist[self.index].howl.stop()
        self.playlist = [songData];
        self.play(0);
    }
  },
  playNext: function(songDataObj) {
    var self = this;
    let songData = createSongObj(songDataObj);
    let isArray = Array.isArray(songData);
    if (isArray) {
      songData.map(songItem => {
        let pos = songData.indexOf(songItem) + 1;
        self.playlist.splice(pos + self.index, 0, songItem);
      })
    } else {
      self.playlist.splice(self.index + 1, 0, songData);
    }
  },
  addSongToQueue: function(songDataObj) {
    var self = this;
    let songData = createSongObj(songDataObj);
    let isArray = Array.isArray(songData);
    if (isArray) {
      songData.map(songItem => {
        self.playlist.push(songItem);
      })
    } else {
      self.playlist.push(songData);
    }
  },
  removeSongFromQueue: function(songPos) {
    var self = this;
    if (self.playlist.length === 1) {
      self.resetPlaylist();
    } else if (songPos == self.index) {
      self.playlist[songPos].howl.stop();
      self.playlist.splice(songPos, 1);
      if (songPos == self.playlist.length) {
        songPos = songPos - 1;
      }
      self.play(songPos);
    } else {
      self.playlist.splice(songPos, 1);
    }
  },
  resetPlaylist: function() {
    var self = this;
    self.playlist[0].howl.stop();
    self.playlist = [];
    self.index = 0
    self.is_sliding = false
    self.is_looped = false
  },
  play: function(index) {
    var self = this;
    var sound;

    index = typeof index === 'number' ? index : self.index;
    var data = self.playlist[index];

    if (data.howl) {
      sound = data.howl;
    } else {
      sound = data.howl = new Howl({
        src: [data.file],
        html5: false,
        onplay: function () {
          // Display duration
          let fullTime = self.formatTime(Math.round(sound.duration()));
          // Set the max of the timeSlider to be the sound duration
          // $('#timeSlider').slider("option", 'max', sound.duration());
          // Start updating the progress of the track
          // requestAnimationFrame(self.step.bind(self));
          self.reactObj.setTimerValue(sound.duration());
          self.reactObj.getSongDuration(fullTime);
          self.reactObj.step();
        },
        onseek: function() {
          // Start updating the progress of the track
          self.reactObj.step();
        },
        onend: function() {
          if (!self.is_looped) {
            self.skip("next");
          }
        }
      });
    }
    // Begin playing the sound
    sound.play();
    // When you skip, or click on a different song if the repeat is still on we 
    // need to loop that song we are going to vise versa if the repeat is off
    if (self.is_looped) {
      sound.loop(true);
    } else {
      sound.loop(false);
    }
    // Show the pause button
    // playBtn.style.display = 'none';
    // pauseBtn.style.display = 'block';
    // Keep track of the index we are currently using
    self.index = index;
  },
  // Pause the currently playing track.
  pause: function() {
    var self = this;
    // Get the Howl we want to manipulate
    var sound = self.playlist[self.index].howl;
    // Pause the sound.
    sound.pause();

    // Show the play button.
    // playBtn.style.display = 'block';
    // pauseBtn.style.display = 'none';
  },
  skip: function(direction) {
    var self = this;
    // Get the next track based on the direction of the track
    var index = 0;
    if (direction === 'prev') {
      index = self.index - 1;
      if (index < 0) {
        index = self.playlist.length - 1;
      }
    } else {
      index = self.index + 1;
      if (index >= self.playlist.length) {
        index = 0;
      }
    }
    self.skipTo(index);
  },
  skipTo: function(index) {
    var self = this;
    // Stop the current track
    if (self.playlist[self.index].howl) {
      self.playlist[self.index].howl.stop();
    }

    // Reset audio scrub
    // $('#timeSlider').slider("value", 0);
    // Play the new track
    self.reactObj.setTimerValue(0);
    self.play(index);
  },

  seek: function(val) {
    var self = this;
    var sound = self.playlist[self.index].howl;

    sound.seek(val);
  },

  step: function() {
    var self = this;

    // Get the Howl we want to manipulate
    var sound = self.playlist[self.index].howl;
    // Determine the current seek position.
    var seek = sound.seek() || 0;
    if (!self.is_sliding) {
      // timer.innerHTML = self.formatTime(Math.round(seek));
      // Increments the slider by the current seek postion should be by 1
      // $('#timeSlider').slider("value", (seek || 0));
    }
    if (sound.playing()) {
      requestAnimationFrame(self.step.bind(self));
    }
  },
  // When scrubbing the audio it changes the timer
  scrubTimer: function(sec) {
    var self = this;
  },
  toggleVolume: function() {
    var self = this;
  },
  toggleMute: function() {
    var self = this;
  },

  getCurrentHowl: function() {
    var self = this;
    let sound = self.playlist[self.index].howl;
    return sound;
  },

  // Set the volume and update the volume slider display.
  volume: function(val) {
    var self = this;
    // Update the global volume
    Howler.volume(val);
  },
  repeat: function(toggle) {
    var self = this;
    var sound = self.playlist[self.index].howl
    self.is_looped = toggle;
    console.log(toggle);
    sound.loop(toggle);
  },
  shuffle: function(shuffledArray) {
    let self = this;
    let currentSong = self.playlist[self.index];
    let songData = createSongObj(shuffledArray);
    songData.splice(self.index, 0, currentSong);
    self.playlist = songData;
  },

  // Format Time function from seconds -> M:SS
  formatTime: function(secs) {
    var minutes = Math.floor(secs / 60) || 0;
    var seconds = (secs - minutes * 60) || 0;

    return minutes + ':' + (seconds < 10 ? '0': '') + seconds;
  }
};

export {Player}