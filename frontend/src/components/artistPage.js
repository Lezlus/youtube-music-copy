import React, { Component } from 'react';
import AlbumPopUp from './PopUpMenu/albumPopUp'
import MyContext from "../context/authContext";
import libraryService from '../services/libraryService';
import playlistFuncs from '../utils/playlistFunc';
import getSongDataService from '../services/getData';
import PlaylistSongRow from './SongRow';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import Modal from '@material-ui/core/Modal';
import ItemDisplay from './itemDisplay';
import EnhancedSongRow from './SongRow'
import EnhancedAlbum from './album';

const ArtistHeader = (props) => {
  return (
    <div className="artist-header">
      <div className="row artist-img-container">
        <div className="col-12 px-0">
          <img className="img-fluid" src={props.artist.image} alt={props.artist.name} />
        </div>
      </div>
      <div className="artist-name">
        <h1 className="title-music-list">{props.artist.name}</h1>
        <button className="btn shuffle-btn btn-lg" onClick={() => {props.shufflePlay()}}>SHUFFLE</button>
      </div>
    </div>
  )
}

class ArtistPage extends Component {
  static contextType = MyContext;
  constructor (props) {
    super(props);
    this.state = {
      songs: [],
      albums: [],
      artist: {},
      showCreatePlaylistModal: false,
      newPlaylist: {name: "", public: false, songsAmount: "0", totalDuration: "0", songs: []}
    };

    this.getArtistData = this.getArtistData.bind(this);
    this.shufflePlay = this.shufflePlay.bind(this);
    this.addToQueue = this.addToQueue.bind(this);
    this.playNext = this.playNext.bind(this);
    this.playPlaylistSong = this.playPlaylistSong.bind(this);
    this.songRow = this.songRow.bind(this);
    this.albumList = this.albumList.bind(this);

    // Create new playlist modal
    this.handleOpenCreatePlaylistModal = this.handleOpenCreatePlaylistModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.onChangeNewPlaylistName = this.onChangeNewPlaylistName.bind(this);
    this.onChangeNewPlaylistPrivacy = this.onChangeNewPlaylistPrivacy.bind(this);
    this.onSubmitNewPlaylistForm = this.onSubmitNewPlaylistForm.bind(this);
    this.resetForm = this.resetForm.bind(this);


    this.removeAlbumFromLibrary = this.removeAlbumFromLibrary.bind(this);
    this.addAlbumToLibrary = this.addAlbumToLibrary.bind(this);
    this.addToPlaylist = this.addToPlaylist.bind(this);
    this.addSongToLibrary = this.addSongToLibrary.bind(this);
    this.removeSongFromLibrary = this.removeSongFromLibrary.bind(this);
    this.addSongToPlaylist = this.addSongToPlaylist.bind(this);
    this.addToLikedSongs = this.addToLikedSongs.bind(this);
    this.removeFromLikedSongs = this.removeFromLikedSongs.bind(this);
  }

  componentDidMount() {
    let artistId = this.props.match.params.id;
    this.getArtistData(artistId);
  }

  handleOpenCreatePlaylistModal(songs) {
    let addedSongs = []
    if (songs) {
      if (Array.isArray(songs)) {
        addedSongs = songs;
      } else {
        addedSongs.push(songs);
      }
    }
    let newPlaylistDummy = {...this.state.newPlaylist};
    newPlaylistDummy.songs = addedSongs;
    this.setState({showCreatePlaylistModal: true, newPlaylist: newPlaylistDummy});
  }

  handleCloseModal() {
    this.resetForm();
    this.setState({showCreatePlaylistModal: false});
  }

  onChangeNewPlaylistName(e) {
    let newPlaylistDummy = {...this.state.newPlaylist};
    newPlaylistDummy.name = e.target.value;
    this.setState({newPlaylist: newPlaylistDummy})
  }

  onChangeNewPlaylistPrivacy(e) {
    let privateField = !(e.target.value === "private")
    let newPlaylistDummy = {...this.state.newPlaylist};
    newPlaylistDummy.public = privateField
    this.setState({newPlaylist: newPlaylistDummy})
  }

  onSubmitNewPlaylistForm(e) {
    e.preventDefault();
    libraryService.createPlaylist(this.state.newPlaylist)
      .then(data => {
        this.handleCloseModal();
        let newContextPlaylists = [...this.context.playlists];
        newContextPlaylists.push(data.newPlaylist);
        this.context.setPlaylist(newContextPlaylists)
        if (data.message.msgError) {
          this.context.setUser("");
          this.context.setIsAuthenticated(false);
          this.context.setLibrary({});
        }
      })
  }

  resetForm() {
    this.setState({newPlaylist: {name: "", public: false, songsAmount: "0", totalDuration: "0", songs: []}})
  }

  async getArtistData(id) {
    const artistData = await getSongDataService.getArtistData(id);
    this.setState({
      songs: artistData.songs,
      albums: artistData.albums,
      artist: artistData,
    });
  }

  shufflePlay() {
    this.props.shufflePlayCollection([...this.state.songs]);
  }

  addToQueue(songObj) {
    if (songObj.typeItem === "Playlist") {
      this.props.addToQueueNewQueueSong([...this.state.songs]);
    } else {
      this.props.addToQueueNewQueueSong({...songObj});
    }
  }

  playNext(songObj) {
    if (songObj.typeItem === "Playlist") {
      this.props.playNextQueueSong([...this.state.songs]);
    } else {
      this.props.playNextQueueSong({...songObj});
    }
  }

  addAlbumToLibrary(album) {
    libraryService.addAlbumToLibrary(album._id)
      .then(data => {
        // Update the library data context
        let newLibraryData = {...this.context.libraryData}
        let newLibraryDataAlbums = newLibraryData.library.albums;
        newLibraryDataAlbums.push(album._id);
        newLibraryData.library.albums = newLibraryDataAlbums;

        // Update the songs 
        newLibraryData.library.songs = data.updatedSongs;
        this.context.setLibrary(newLibraryData);
      })
  }

  removeAlbumFromLibrary(album) {
    libraryService.removeAlbumFromLibrary(album._id)
      .then(data => {
        let newLibraryData = {...this.context.libraryData}
        newLibraryData.library.songs = data.updatedSongs;
        // Update the library data context
        let newLibraryDataAlbums = newLibraryData.library.albums;
        const albumToRemoveIndex = newLibraryDataAlbums.indexOf(album._id);
        newLibraryDataAlbums.splice(albumToRemoveIndex, 1);
        newLibraryData.library.albums = newLibraryDataAlbums;

        this.context.setLibrary(newLibraryData);
      })
  }

  addSongToLibrary(song) {
    libraryService.addSongToLibrary(song._id)
      .then(data => {
        let libraryData = {...this.context.libraryData};
        libraryData.library.songs.push(song._id);
        this.context.setLibrary(libraryData);
      })
  }

  removeSongFromLibrary(song) {
    libraryService.removeSongFromLibrary(song._id)
      .then(data => {
        let libraryData = {...this.context.libraryData};
        const removedSongIndex = libraryData.library.songs.indexOf(song._id);
        libraryData.library.songs.splice(removedSongIndex, 1);
        this.context.setLibrary(libraryData);
      })
  }

  addToPlaylist(playlistId, data) {
    libraryService.addPlaylistToPlaylist(playlistId, data)
      .then(updatedData => {
        let contextPlaylists = [...this.context.playlists];
        let playlistIndex = playlistFuncs.getPlaylistIndex(playlistId, contextPlaylists);
        contextPlaylists[playlistIndex].songs = updatedData.songs;
        this.context.setPlaylist(contextPlaylists);
      })
  }

  addSongToPlaylist(songId, playlistId) {
    libraryService.addToPlaylist(songId, playlistId)
      .then(updatedData => {
        let contextPlaylists = [...this.context.playlists];
        let playlistIndex = playlistFuncs.getPlaylistIndex(playlistId, contextPlaylists);
        contextPlaylists[playlistIndex].songs = updatedData.songs;
        this.context.setPlaylist(contextPlaylists);
      })
  }

  addToLikedSongs(songId) {
    libraryService.addToLikedPlaylist(songId)
      .then(data =>{
        let likedPlaylistData = {...this.context.likedPlaylist};
        likedPlaylistData.songs.push(songId);
        this.context.setLikedPlaylist(likedPlaylistData);
      })
  }

  removeFromLikedSongs(songId) {
    libraryService.removeFromPlaylist(songId, this.context.likedPlaylist._id)
      .then(data =>{
        // Change liked playlist context
        let likedPlaylistData = {...this.context.likedPlaylist};
        const removedSongIndex = likedPlaylistData.songs.indexOf(songId);
        likedPlaylistData.songs.splice(removedSongIndex, 1);
        this.context.setLikedPlaylist(likedPlaylistData);
      })
  }

  songRow() {
    let i = -1;
    return this.state.songs.map(currentSong => {
      i++
      return <EnhancedSongRow 
                data={currentSong} 
                key={currentSong._id} 
                pos={i} 
                playPlaylistSong={this.playPlaylistSong} 
                playNext={this.playNext} 
                addToQueue={this.addToQueue}
                playlist={this.state.album}
                removeFromLibrary={this.removeSongFromLibrary}
                addToLibrary={this.addSongToLibrary}
                addToPlaylist={this.addSongToPlaylist}
                addToLikedSongs={this.addToLikedSongs}
                removeFromLikedSongs={this.removeFromLikedSongs}
                popUpPage="artistPage"
                page="artistPage"
                handleOpenCreatePlaylistModal={this.handleOpenCreatePlaylistModal}
              />;
    })
  }

  playPlaylistSong(pos) {
    this.props.playSinglePlaylist([...this.state.songs], pos)
  }

  albumList() {
    return this.state.albums.map(currentAlbum => {
      return <EnhancedAlbum
              data={currentAlbum} 
              key={currentAlbum._id} 
              shufflePlay={this.shufflePlay} 
              addToQueue={this.addToQueue}
              playNext={this.playNext} 
              popUpPage="artistPage"
              page="artistPage"
              removeFromLibrary={this.removeAlbumFromLibrary}
              addToLibrary={this.addAlbumToLibrary}
              addToPlaylist={this.addToPlaylist}
              handleOpenCreatePlaylistModal={this.handleOpenCreatePlaylistModal}
            />
    })
  }

  render() {
    return (
      <div className="container-fluid main-container">
        <Modal
          open={this.state.showCreatePlaylistModal}
          onClose={this.handleCloseModal}
        >
          <div className="create-modal">
            <h3 className="white-txt">New Playlist</h3>
            <form onSubmit={this.onSubmitNewPlaylistForm}>
              <div className="form-group">
                <input type="text" className="form-control" id="playlistTitle" placeholder="Title" onChange={this.onChangeNewPlaylistName} />
              </div>
              <div className="form-group">
                <label htmlFor="privateSelect" className="white-txt">Privacy</label>
                <select className="form-control" name="privateSelect" id="privateSelect" onChange={this.onChangeNewPlaylistPrivacy}>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>
              <button className="btn btn-sm btn-primary" onClick={this.handleCloseModal}>Cancel</button>
              <button className="btn btn-sm btn-primary" type="submit">Create Playlist</button>
            </form>
          </div>
        </Modal>
        <ArtistHeader artist={this.state.artist} shufflePlay={this.shufflePlay} />
        <div className="songs-container">
          <h3 className="title-music-list">Songs</h3>
          <div className="songs-row-container">
            {this.songRow()}
          </div>
        </div>
        <div className="playlist-container">
          <h3 className="title-music-list">Albums</h3>
          <div className="row albums-container">
            {this.albumList()}
          </div>
        </div>
      </div>
    )
  }
}

export default ArtistPage;