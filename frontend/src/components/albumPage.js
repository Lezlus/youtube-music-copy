// Playlist page and album page are very similar ui wise
// Might create an abstract component thats wraps both

import React, { Component } from 'react';
import AlbumPopUp from './PopUpMenu/albumPopUp'
import MyContext from "../context/authContext";
import libraryService from '../services/libraryService';
import playlistFuncs from '../utils/playlistFunc';
import getSongDataService from '../services/getData';
import EnhancedSongRow from './SongRow';
import { Link } from 'react-router-dom';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';

class AlbumHeader extends Component {
  static contextType = MyContext;
  constructor (props) {
    super(props);
    this.state = {
      anchorEl: null,
      addToPlaylistSnackBarOpen: false,
      migratePlaylistId: "",
    }

    // Popup Menu
    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.setAnchorEl = this.setAnchorEl.bind(this);

    // Snackbar duplicates options
    this.addToPlaylistSnackBarClick = this.addToPlaylistSnackBarClick.bind(this);
    this.addToPlaylistSnackBarClose = this.addToPlaylistSnackBarClose.bind(this);
    this.handleAddToPlaylistDuplicates = this.handleAddToPlaylistDuplicates.bind(this);
    this.checkAddToPlaylistDuplicates = this.checkAddToPlaylistDuplicates.bind(this);

    // Menu options
    this.playNextClick = this.playNextClick.bind(this);
    this.addToQueueClick = this.addToQueueClick.bind(this);
    
    this.shufflePlayClick = this.shufflePlayClick.bind(this);
    this.removeOrAddToLibrary = this.removeOrAddToLibrary.bind(this);
    this.removeAlbumFromLibraryClick = this.removeAlbumFromLibraryClick.bind(this);
    this.addAlbumToLibraryClick = this.addAlbumToLibraryClick.bind(this);
  }

  handleClick(event) {
    this.setAnchorEl(event.currentTarget);
  }

  handleClose() {
    this.setAnchorEl(null);
  }

  setAnchorEl(value) {
    this.setState({
      anchorEl: value
    })
  }

  playNextClick() {
    this.props.playNext(this.props.album);
    this.handleClose()

  }

  addToQueueClick() {
    this.props.addToQueue(this.props.album);
    this.handleClose()
  }

  shufflePlayClick() {
    this.handleClose()
    this.props.shufflePlay();
  }

  removeOrAddToLibrary() {
    if (this.context.isAuthenticated) {
      if (this.context.libraryData.library.albums.includes(this.props.album._id)) {
        return <button className="btn btn-primary" onClick={() => {this.removeAlbumFromLibraryClick()}}>REMOVE FROM LIBRARY</button>;
      } else {
        return <button className="btn btn-primary" onClick={() => {this.addAlbumToLibraryClick()}}>ADD TO LIBRARY</button>;
      }
    }
  }

  removeAlbumFromLibraryClick() {
    this.props.removeFromLibrary(this.props.album);
  }

  addAlbumToLibraryClick() {
    this.props.addToLibrary(this.props.album);
  }

  addToPlaylistSnackBarClick() {
    this.setState({
      addToPlaylistSnackBarOpen: true,
    });
  }

  addToPlaylistSnackBarClose(event, reason) {
    this.setState({
      addToPlaylistSnackBarOpen: false,
      migratePlaylistId: "",
    });
    if (reason === 'clickaway') {
      return ;
    }
  }

  checkAddToPlaylistDuplicates(playlistId) {
    let contextPlaylists = [...this.context.playlists];
    let playlistIndex = playlistFuncs.getPlaylistIndex(playlistId, contextPlaylists);
    let songIncluded = playlistFuncs.playlistSongInPlaylist(this.props.album.songs, contextPlaylists[playlistIndex].songs);
    if (songIncluded) {
      this.addToPlaylistSnackBarClick();
      this.setState({
        migratePlaylistId: playlistId,
      })
    } else {
      this.props.addToPlaylist(playlistId, {songs: this.props.album.songs, option: "Add Anyway"});
    }
  }

  handleAddToPlaylistDuplicates(option) {
    if (option === "Add Anyway") {
      this.props.addToPlaylist(this.state.migratePlaylistId, {songs: this.props.album.songs, option: "Add Anyway"});
    } else {
      this.props.addToPlaylist(this.state.migratePlaylistId,{songs: this.props.album.songs, option: "Skip Duplicates"});
    }
    this.setState({ 
      migratePlaylistId: "",
    })
    this.addToPlaylistSnackBarClose();
  }

  render() {
    return (
      <div className="row playlist-header">
        <div className="col-3">
          <div className="playlist-img-wrapper">
            <img className="img-fluid" src={this.props.album.image} alt={this.props.album.name} />
          </div>
        </div>
        <div className="col-5">
          <h1 className="white-txt">{this.props.album.name}</h1>
          <h5 className="white-txt">{this.props.album.typeItem} 
            <span className="dot-seperator">&#183;</span>
            <Link to={"/artist/" + this.props.album.artist._id}>
              <span>{this.props.album.artist.name}</span>
            </Link> 
            <span className="dot-seperator">&#183;</span> 
            <span>{this.props.album.releaseYear}</span>
          </h5>
          
          <div>
            <button className="btn btn-primary" onClick={() => {this.props.playPlaylistSong(0)}}>PLAY</button>
            {this.removeOrAddToLibrary()}
            <i className="fas fa-ellipsis-v playlist-options" onClick={this.handleClick}></i>
          </div>
          <AlbumPopUp 
            addToQueueClick={this.addToQueueClick} playNextClick={this.playNextClick} 
            anchorEl={this.state.anchorEl} setAnchorEl={this.setAnchorEl} 
            album={this.props.album} handleClose={this.handleClose}
            shufflePlayClick={this.shufflePlayClick} checkAddToPlaylistDuplicates={this.checkAddToPlaylistDuplicates}
            popUpPage="albumPage"
            handleOpenCreatePlaylistModal={this.props.handleOpenCreatePlaylistModal}
          />
          <Snackbar
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left"
            }}
            open={this.state.addToPlaylistSnackBarOpen}
            autoHideDuration={6000}
            onClose={this.addToPlaylistSnackBarClose}
            message="Duplicates detected"
            action={
              <React.Fragment>
                <Button color="secondary" onClick={() => {this.handleAddToPlaylistDuplicates("Add Anyway")}}>
                  Add anyway
                </Button>
                <Button color="secondary" onClick={() => {this.handleAddToPlaylistDuplicates("Skip Duplicates")}}>
                  Skip duplicates
                </Button>
              </React.Fragment>
            }
          />
        </div>
      </div>
    )
  }
}

export default class AlbumPage extends Component {
  static contextType = MyContext;
  constructor (props) {
    super(props);
    this.state = {
      songs: [],
      album: {artist: {}},
      showCreatePlaylistModal: false,
      newPlaylist: {name: "", public: false, songsAmount: "0", totalDuration: "0", songs: []},
    };

    // Create new playlist modal
    this.handleOpenCreatePlaylistModal = this.handleOpenCreatePlaylistModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.onChangeNewPlaylistName = this.onChangeNewPlaylistName.bind(this);
    this.onChangeNewPlaylistPrivacy = this.onChangeNewPlaylistPrivacy.bind(this);
    this.onSubmitNewPlaylistForm = this.onSubmitNewPlaylistForm.bind(this);
    this.resetForm = this.resetForm.bind(this);

    this.addSongToLibrary = this.addSongToLibrary.bind(this);
    this.removeSongFromLibrary = this.removeSongFromLibrary.bind(this);
    this.addAlbumToLibrary = this.addAlbumToLibrary.bind(this);
    this.removeAlbumFromLibrary = this.removeAlbumFromLibrary.bind(this);
    this.addToPlaylist = this.addToPlaylist.bind(this);
    this.addSongToPlaylist = this.addSongToPlaylist.bind(this);

    this.playPlaylistSong = this.playPlaylistSong.bind(this);
    this.shufflePlay = this.shufflePlay.bind(this);
  }

  componentDidMount() {
    let albumId = this.props.match.params.id;
    this.getAlbumSongData(albumId);
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
        if (!data.message.msgError) {
          this.getPlaylistLibraryData();
        } else {
          this.context.setUser("");
          this.context.setIsAuthenticated(false);
          this.context.setLibrary({});
        }
      })
  }

  resetForm() {
    this.setState({newPlaylist: {name: "", public: false, songsAmount: "0", totalDuration: "0", songs: []}})
  }

  async getAlbumSongData(id) {
    const albumData = await getSongDataService.getAlbumData(id);
    this.setState({
      songs: albumData.songs,
      album: albumData
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

  playPlaylistSong(pos) {
    this.props.playSinglePlaylist([...this.state.songs], pos)
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

  addSongToPlaylist(songId, playlistId) {
    libraryService.addToPlaylist(songId, playlistId)
      .then(updatedData => {
        let contextPlaylists = [...this.context.playlists];
        let playlistIndex = playlistFuncs.getPlaylistIndex(playlistId, contextPlaylists);
        contextPlaylists[playlistIndex].songs = updatedData.songs;
        this.context.setPlaylist(contextPlaylists);
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
                popUpPage="albumPage"
                page="albumPage"
                handleOpenCreatePlaylistModal={this.handleOpenCreatePlaylistModal}
              />
    })
  }

  albumHeader() {
    return <AlbumHeader
              playPlaylistSong={this.playPlaylistSong}
              album={this.state.album} shufflePlay={this.shufflePlay}
              playNext={this.playNext} addToQueue={this.addToQueue}
              getAlbumSongData={this.getAlbumSongData}
              addToPlaylist={this.addToPlaylist}
              addToLibrary={this.addAlbumToLibrary}
              removeFromLibrary={this.removeAlbumFromLibrary}
              handleOpenCreatePlaylistModal={this.handleOpenCreatePlaylistModal}
            />
  }

  render() {
    return (
      <div className="container main-container">
        {this.albumHeader()}
        {this.songRow()}
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
      </div>
    )
  }
}