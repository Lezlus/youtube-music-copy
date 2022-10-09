import axios from "axios";

export default {
  getAllPublicPlaylists: () => {
    return axios.get("http://localhost:5000/playlists/")
      .then(response => response.data)
      .catch(err => console.log(err));
  },
  getAllSongs: () => {
    return axios.get("http://localhost:5000/songs/")
      .then(response => response.data)
      .catch(err => console.log(err))
  },
  getAllAlbums: () => {
    return axios.get("http://localhost:5000/albums/")
      .then(response => response.data)
      .catch(err => console.log(err))
  },
  gettAllArtists: () => {
    return axios.get("http://localhost:5000/artists/")
      .then(response => response.data)
      .catch(err => console.log(err))
  },
  getPlaylistData: (id) => {
    return axios.get("http://localhost:5000/playlists/" + id)
      .then(response => response.data)
      .catch(err => console.log(err))
  },
  getAlbumData: (id) => {
    return axios.get('http://localhost:5000/albums/' + id)
      .then(response => response.data)
      .catch(err => console.log(err))
  },
  getArtistData: (id) => {
    return axios.get('http://localhost:5000/artists/' + id)
      .then(response => response.data)
      .catch(err => console.log(err))
  },
}