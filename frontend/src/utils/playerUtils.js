// Utility functions related to the player class

/**
  * Converts the song data to be used in Player.playlist
  * Returns either a single object or array of objects
  * Depending on the arg
*/
function createSongObj(songData) {
  let isArray = Array.isArray(songData);
  let validSongData = null;
  if (isArray) {
    validSongData = [];
    songData.map(songItem => {
      let updatedSongObj = {
        title: songItem.title,
        file: songItem.audioFile,
        artist: songItem.artist.name,
        duration: songItem.duration,
        howl: null,
      }
      validSongData.push(updatedSongObj);
    })
    return validSongData;
  } else {
    validSongData = {
      title: songData.title,
      file: songData.audioFile,
      artist: songData.artist.name,
      duration: songData.duration,
      howl: null,
    }
    return validSongData;
  }
}

/**
 * Used to check edge case, when you click on the same song that is already playing
 * It should only slide up but not re play the same song
 * @param {*} newSongObj 
 * @param {*} currentSongObj 
 * @returns bool
 */
function currentSongIsObject(newSongObj, currentSongObj) {
  var i;
  let newTitle = newSongObj.title;
  let newArtist = newSongObj.artist;

  let oldTitle = currentSongObj.title;
  let oldArtist = currentSongObj.artist;

  if (oldTitle == newTitle && oldArtist == newArtist) {
    return true;
  } else {
    return false;
  }

}

/**
 * Based of the Fisher Yates shuffle algorithm
 * In the context of a music queue it should shuffle the song data objects
 * Use this when you have the currently playing song object since you need to insert it back
 * @param {*} array 
 * @returns array
 */
function shuffleArray(array) {
  var currentIndex = array.length, randomIndex;

  // While there remains elements to shuffle
  while (0 !== currentIndex) {

    // Pick a remaining element
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

export {createSongObj, currentSongIsObject, shuffleArray}