import axios from 'axios';

const axiosCookieConfig = axios.create({
  withCredentials: true,
  baseURL: "http://localhost:5000"
});

export default { 
  getLibrary: () => {
    return axiosCookieConfig.get('/library')
      .then(response => {
        return response.data;
      })
      .catch(err => {
        console.log(err);
        return {library: {songs: []}, message: {msgBody: "UnAuthorized", msgError: true}};
      })
  },
  getLibraryPopulated: () => {
    return axiosCookieConfig.get('/library/populated-library')
      .then(response => {
        return response.data;
      })
      .catch(err => {
        console.log(err);
        return {library: {songs: []}, message: {msgBody: "UnAuthorized", msgError: true}};
      })
  },
  getUsersLikedPlaylist: () => {
    return axiosCookieConfig.get('/playlists/find-your-likes')
      .then(response => response.data)
      .catch(err => {
        console.log(err);
        return {message: {msgBody: "UnAuthorized", msgError: true}};
      })
  },
  createPlaylist: playlist => {
    return axiosCookieConfig.post('/playlists/add', playlist)
      .then(response => {
        return response.data
      })
      .catch(err => {
        console.log(err);
        return {message: {msgBody: "UnAuthorized", msgError: true}};
      })
  },

  addSongToLibrary: (songId) => {
    return axiosCookieConfig.get(`/songs/add-to-library/${songId}`)
      .then(response => {
        return response.data;
      })
      .catch(err => {
        console.log(err);
        return {message: {msgBody: "UnAuthorized", msgError: true}};
      });
  },

  removeSongFromLibrary: (songId) => {
    return axiosCookieConfig.get(`songs/remove-from-library/${songId}`)
      .then(response => {
        return response.data;
      })
      .catch(err => {
        console.log(err);
        return {message: {msgBody: "UnAuthorized", msgError: true}};
      })
  },

  addToLikedPlaylist: (songId) => {
    return axiosCookieConfig.get(`songs/add-to-liked-playlist/${songId}`)
      .then(response => {
        return response.data;
      })
      .catch(err => {
        console.log(err);
        return {message: {msgBody: "UnAuthorized", msgError: true}};
      })
  },

  addToPlaylist: (songId, playlistId) => {
    return axiosCookieConfig.get(`songs/add-to-playlist/${playlistId}/${songId}`)
      .then(response => {
        return response.data
      })
      .catch(err => {
        console.log(err);
        return {message: {msgBody: "UnAuthorized", msgError: true}};
      })
  },

  removeFromPlaylist: (songId, playlistId, duplicateOption) => {
    return axiosCookieConfig.post(`songs/remove-from-playlist/${playlistId}/${songId}`, duplicateOption)
      .then(response => {
        return response.data;
      })
      .catch(err => {
        console.log(err);
        return {message: {msgBody: "UnAuthorized", msgError: true}};
      })
  },

  deletePlaylist: (playlistId) => {
    return axiosCookieConfig.get(`playlists/delete-playlist/${playlistId}`)
      .then(response => {
        return response.data;
      })
      .catch(err => {
        console.log(err);
        return {message: {msgBody: "UnAuthorized", msgError: true}};
      })
  },
  addPlaylistToLibrary: (playlistId) => {
    return axiosCookieConfig.get(`playlists/add-to-library/${playlistId}`)
      .then(response => {
        return response.data;
      })
      .catch(err => {
        console.log(err);
        return {message: {msgBody: "UnAuthorized", msgError: true}};
      })
  },

  removePlaylistFromLibrary: (playlistId) => {
    return axiosCookieConfig.get(`playlists/remove-from-library/${playlistId}`)
      .then(response => {
        return response.data;
      })
      .catch(err => {
        console.log(err);
        return {message: {msgBody: "UnAuthorized", msgError: true}};
      })
  },

  addPlaylistToPlaylist: (migratePlaylistId, songsArrayData) => {
    return axiosCookieConfig.post(`playlists/add-to-playlist/${migratePlaylistId}/`, songsArrayData)
      .then(response => {
        return response.data;
      })
      .catch(err => {
        console.log(err);
        return {message: {msgBody: "UnAuthorized", msgError: true}};
      })
  },
  updatePlaylist: (playlistId, updatedData) => {
    return axiosCookieConfig.put(`playlists/update-playlist/${playlistId}`, updatedData)
      .then(response => {
        return response.data;
      })
      .catch(err => {
        console.log(err);
        return {message: {msgBody: "UnAuthorized", msgError: true}};
      })
  },

  addAlbumToLibrary: (albumId) => {
    return axiosCookieConfig.get(`albums/add-to-library/${albumId}`)
      .then(response => {
        return response.data;
      })
      .catch(err => {
        console.log(err);
        return {message: {msgBody: "UnAuthorized", msgError: true}};
      })
  },
  removeAlbumFromLibrary: (albumId) => {
    return axiosCookieConfig.get(`albums/remove-from-library/${albumId}`)
      .then(response => {
        return response.data;
      })
      .catch(err => {
        console.log(err);
        return {message: {msgBody: "UnAuthorized", msgError: true}};
      })
  },
}