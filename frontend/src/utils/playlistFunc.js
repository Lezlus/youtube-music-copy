
export default {
  getPlaylistIndex: (playlistId, playlists) => {
    for (let i = 0; i < playlists.length; i++) {
      if (playlists[i]._id === playlistId) {
        return i;
      }
    }
    return null;
  },

  playlistSongInPlaylist: (songs, migrateSongs) => {
    for (let i = 0; i < migrateSongs.length; i++) {
      if (migrateSongs.includes(songs[i])) {
        return true;
      }
    }
    return false;
  }, 

  countDuplicates: (songId, songsArray) => {
    let count = 0;
    for (let i = 0; i < songsArray.length; i++) {
      if (songsArray[i]._id === songId) {
        count += 1;
      }
    }

    if (count > 1) {
      return true;
    }
    return false;
  }
}