import React, { Component } from 'react';
import axios from 'axios';
import PlaylistPopUp from './PopUpMenu/playlistPopUp';
import SongPopUp from './PopUpMenu/songPopUp';
import MyContext from "../context/authContext";
import libraryService from '../services/libraryService';
import playlistFuncs from '../utils/playlistFunc';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import getSongDataService from '../services/getData';
import EnhancedSongRow from './SongRow';
import {v4 as uuidv4} from 'uuid';

class PlaylistHeader extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      deletePlaylistModalOpen: false,
      addToPlaylistSnackBarOpen: false,
      updatePlaylistModalOpen: false,

      migratePlaylistId: "",
      updatedPlaylist: {name: "",  public: ""}
    }

    // Popup Menu
    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.setAnchorEl = this.setAnchorEl.bind(this);

    // Delete playlist modal
    this.deletePlaylistModalOpen = this.deletePlaylistModalOpen.bind(this);
    this.deletePlaylistModalClose = this.deletePlaylistModalClose.bind(this);
    this.deletePlaylistClick = this.deletePlaylistClick.bind(this);

    // Update playlist modal
    this.updatePlaylistModalClick = this.updatePlaylistModalClick.bind(this);
    this.updatePlaylistModalClose = this.updatePlaylistModalClose.bind(this);
    this.resetUpdatePlaylistForm = this.resetUpdatePlaylistForm.bind(this);
    this.submitUpdatedPlaylist = this.submitUpdatedPlaylist.bind(this);
    this.handleUpdatePlaylistTitle = this.handleUpdatePlaylistTitle.bind(this);
    this.handleUpdatePlaylistPublic = this.handleUpdatePlaylistPublic.bind(this);

    // Snackbar duplicates options
    this.checkAddToPlaylistDuplicates = this.checkAddToPlaylistDuplicates.bind(this);
    this.addToPlaylistSnackBarClick = this.addToPlaylistSnackBarClick.bind(this);
    this.addToPlaylistSnackBarClose = this.addToPlaylistSnackBarClose.bind(this);
    this.handleAddToPlaylistDuplicates = this.handleAddToPlaylistDuplicates.bind(this);

    // Menu options
    this.playNextClick = this.playNextClick.bind(this);
    this.addToQueueClick = this.addToQueueClick.bind(this);

    this.shufflePlayClick = this.shufflePlayClick.bind(this);
    this.editPlaylistOrRemoveAddToLibrary = this.editPlaylistOrRemoveAddToLibrary.bind(this);
    this.removePlaylistFromLibraryClick = this.removePlaylistFromLibraryClick.bind(this);
    this.addPlaylistToLibraryClick = this.addPlaylistToLibraryClick.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.playlist.name !== this.props.playlist.name) {
      let publicType = this.props.playlist.public ? "public" : "private";
      this.setState({
        updatedPlaylist: {name: this.props.playlist.name,  public: publicType}
      });
    }
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
    this.props.playNext(this.props.playlist);
    this.handleClose()

  }

  addToQueueClick() {
    this.props.addToQueue(this.props.playlist);
    this.handleClose()
  }

  shufflePlayClick() {
    this.props.shufflePlay();
  }

  editPlaylistOrRemoveAddToLibrary() {
    if (this.context.isAuthenticated) {
      if (this.props.playlist.owner === this.context.userId) {
        if (this.props.playlist.name !== "Your Likes") {
          return (
            <button className="btn btn-primary" onClick={() => {this.updatePlaylistModalClick()}}>EDIT PLAYLIST</button>
          );
        }
      } else if(this.context.libraryData.library.playlists.includes(this.props.playlist._id)) {
        return <button className="btn btn-primary" onClick={() => {this.removePlaylistFromLibraryClick()}}>REMOVE FROM LIBRARY</button>;
      } else {
        return <button className="btn btn-primary" onClick={() => {this.addPlaylistToLibraryClick()}}>ADD TO LIBRARY</button>;
      }
    }
  }

  removePlaylistFromLibraryClick() {
    this.props.removeFromLibrary(this.props.playlist)
  }

  addPlaylistToLibraryClick() {
    this.props.addToLibrary(this.props.playlist)
  }

  deletePlaylistModalOpen() {
    this.handleClose();
    this.setState({ 
      deletePlaylistModalOpen: true,
    });
  }

  deletePlaylistModalClose() {
    this.setState({
      deletePlaylistModalOpen: false,
    });
  }

  deletePlaylistClick() {
    this.deletePlaylistModalClose();
    this.props.deletePlaylist();
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
    let songIncluded = playlistFuncs.playlistSongInPlaylist(this.props.playlist.songs, contextPlaylists[playlistIndex].songs);
    if (songIncluded) {
      this.addToPlaylistSnackBarClick();
      this.setState({
        migratePlaylistId: playlistId,
      })
    } else {
      this.props.addToPlaylist(playlistId, {songs: this.props.playlist.songs, option: "Add Anyway"});
    }
  }

  handleAddToPlaylistDuplicates(option) {
    if (option === "Add Anyway") {
      this.props.addToPlaylist(this.state.migratePlaylistId, {songs: this.props.playlist.songs, option: "Add Anyway"});
    } else {
      this.props.addToPlaylist(this.state.migratePlaylistId, {songs: this.props.playlist.songs, option: "Skip Duplicates"});
    }
    this.setState({ 
      migratePlaylistId: "",
    })
    this.addToPlaylistSnackBarClose();
  }

  updatePlaylistModalClick() {
    this.setState({
      updatePlaylistModalOpen: true,
    })
  }

  resetUpdatePlaylistForm() {
    let publicType = this.props.playlist.public ? "public" : "private";
      this.setState({
        updatedPlaylist: {name: this.props.playlist.name,  public: publicType},
        updatePlaylistModalOpen: false,
      });
  }

  updatePlaylistModalClose() {
    this.setState({
      updatePlaylistModalOpen: false,
    })
  }

  submitUpdatedPlaylist() {
    this.updatePlaylistModalClose();
    let publicType = this.state.updatedPlaylist.public === "public"
    let updatedPlaylistData = {name: this.state.updatedPlaylist.name, public: publicType}
    libraryService.updatePlaylist(this.props.playlist._id, updatedPlaylistData)
      .then(data => {
        this.props.getPlaylistSongData(this.props.playlist._id);
      })
      .catch(err => console.log(err));
  }

  handleUpdatePlaylistTitle(e) {
    let updatedPlaylist = {...this.state.updatedPlaylist};
    updatedPlaylist.name = e.target.value;
    this.setState({
      updatedPlaylist: updatedPlaylist
    })
  }

  handleUpdatePlaylistPublic(e) {
    let updatedPlaylist = {...this.state.updatedPlaylist};

    updatedPlaylist.public = e.target.value === "public" ? "public" : "private";
    this.setState({
      updatedPlaylist: updatedPlaylist
    })
  }

  render() {
    return (
      <div className="row playlist-header">
        <div className="col-3">
          <div className="playlist-img-wrapper">
            <img className="img-fluid" src="../song_images/playlist_img.jpg" alt={this.props.playlist.name} />
          </div>
        </div>
        <div className="col-5">
          <h1 className="white-txt">{this.props.playlist.name}</h1>
          <div>
            <button className="btn btn-primary" onClick={() => {this.shufflePlayClick()}}>SHUFFLE</button>
            {this.editPlaylistOrRemoveAddToLibrary()}
            <i className="fas fa-ellipsis-v playlist-options" onClick={this.handleClick}></i>
          </div>
          <PlaylistPopUp 
            addToQueueClick={this.addToQueueClick} playNextClick={this.playNextClick} 
            anchorEl={this.state.anchorEl} setAnchorEl={this.setAnchorEl} 
            deletePlaylistModalOpen={this.deletePlaylistModalOpen} popUpPage="playlistPage"
            playlist={this.props.playlist} handleClose={this.handleClose}
            playlistOwner={this.props.playlist.owner}
            handleOpenCreatePlaylistModal={this.props.handleOpenCreatePlaylistModal}
            checkAddToPlaylistDuplicates={this.checkAddToPlaylistDuplicates}
          />
          <Modal
            open={this.state.deletePlaylistModalOpen}
            onClose={this.deletePlaylistModalClose}
          >
            <div className="create-modal">
              <h3 className="white-txt">Delete playlist</h3>
              <h5 className="white-txt">Are you sure you want to delete this playlist?</h5>
              <h5 onClick={this.deletePlaylistModalClose} className="white-txt">CANCEL</h5>
              <h5 onClick={this.deletePlaylistClick }className="white-txt">DELETE</h5>
            </div>
          </Modal>
          <Modal
            open={this.state.updatePlaylistModalOpen}
            onClose={this.resetUpdatePlaylistForm}
          >
            <div className="create-modal">
              <form onSubmit={this.submitUpdatedPlaylist}>
                <div className="form-group">
                  <label htmlFor="playlistNameUpdate">Title</label>
                  <input onChange={this.handleUpdatePlaylistTitle} type="text" className="form-control" name="playlistNameUpdate" id="playlistNameUpdate" value={this.state.updatedPlaylist.name} />
                </div>
                <div className="form-group">
                  <label htmlFor="updatePrivateSelect" className="white-txt">Privacy</label>
                  <select value={this.state.updatedPlaylist.public} onChange={this.handleUpdatePlaylistPublic} className="form-control" name="updatePrivateSelect" id="updatePrivateSelect">
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                <button className="btn btn-primary btn-lg" onClick={this.resetUpdatePlaylistForm}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-lg">Save</button>
              </form>
            </div>
          </Modal>
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

// A seperate page to view all the songs in a playlist
class PlaylistPage extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      songs: [],
      playlist: {},
      showCreatePlaylistModal: false,
      newPlaylist: {name: "", public: false, songsAmount: "0", totalDuration: "0", songs: []}
    };
    this.getPlaylistSongData = this.getPlaylistSongData.bind(this);
    this.shufflePlay = this.shufflePlay.bind(this);
    this.playPlaylistSong = this.playPlaylistSong.bind(this);
    this.addToQueue = this.addToQueue.bind(this);
    this.playNext = this.playNext.bind(this);
    this.removeFromPlaylist = this.removeFromPlaylist.bind(this);
    this.deletePlaylist = this.deletePlaylist.bind(this);

    // Create new playlist modal
    this.handleOpenCreatePlaylistModal = this.handleOpenCreatePlaylistModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.onChangeNewPlaylistName = this.onChangeNewPlaylistName.bind(this);
    this.onChangeNewPlaylistPrivacy = this.onChangeNewPlaylistPrivacy.bind(this);
    this.onSubmitNewPlaylistForm = this.onSubmitNewPlaylistForm.bind(this);
    this.resetForm = this.resetForm.bind(this);
    
    this.addSongToLibrary = this.addSongToLibrary.bind(this);
    this.removeSongFromLibrary = this.removeSongFromLibrary.bind(this);
    this.addSongToPlaylist = this.addSongToPlaylist.bind(this);
    this.addToLikedSongs = this.addToLikedSongs.bind(this);
    this.removeFromLikedSongs = this.removeFromLikedSongs.bind(this);
    this.removePlaylistFromLibrary = this.removePlaylistFromLibrary.bind(this);
    this.addPlaylistToLibrary = this.addPlaylistToLibrary.bind(this);
    this.addToPlaylist = this.addToPlaylist.bind(this);
  }

  componentDidMount() {
    let playlistId = this.props.match.params.id;
    this.getPlaylistSongData(playlistId);
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

  async getPlaylistSongData(id) {
    const playlistData = await getSongDataService.getPlaylistData(id);
    this.setState({
      playlist: playlistData,
      songs: playlistData.songs,
    });
  }

  shufflePlay() {
    let songsArray = [...this.state.songs]
    this.props.shufflePlayCollection(songsArray);
  }

  addToQueue(songObj) {
    if (songObj.typeItem === "Playlist") {
      this.props.addToQueueNewQueueSong([...this.state.songs]);
    } else {
      this.props.addToQueueNewQueueSong(songObj);
    }
  }

  playNext(songObj) {
    if (songObj.typeItem === "Playlist") {
      this.props.playNextQueueSong([...this.state.songs]);
    } else {
      this.props.playNextQueueSong(songObj);
    }
  }

  deletePlaylist() {
    libraryService.deletePlaylist(this.state.playlist._id)
      .then(data => {
        // Change playlists context
        let playlistsArray = [...this.context.playlists];
        const playlistToDeleteIndex = playlistFuncs.getPlaylistIndex(this.state.playlist._id, playlistsArray);
        playlistsArray.splice(playlistToDeleteIndex, 1);
        this.context.setPlaylist(playlistsArray);
        // Change library data context
        let libraryData = {...this.context.libraryData}
        let libraryPlaylistsArray = [...libraryData.library.playlists];
        const libraryPlaylistToDeleteIndex = libraryPlaylistsArray.indexOf(this.state.playlist._id);
        libraryPlaylistsArray.splice(libraryPlaylistToDeleteIndex, 1);
        libraryData.library.playlists = libraryPlaylistsArray;
        this.context.setLibrary(libraryData);

        this.props.history.push('/library');
      })
  }

  removeFromPlaylist(songId, pos) {
    let songsArray = [...this.state.songs];
    let removingDuplicate = playlistFuncs.countDuplicates(songId, songsArray);
    songsArray.splice(pos, 1);
    this.setState({
      songs: songsArray
    });

    console.log(removingDuplicate)

    libraryService.removeFromPlaylist(songId, this.state.playlist._id, {removingDuplicate: removingDuplicate})
      .then(updatedData => {
        let contextPlaylists = [...this.context.playlists];
        let playlistIndex = playlistFuncs.getPlaylistIndex(this.state.playlist._id, contextPlaylists);
        contextPlaylists[playlistIndex].songs = updatedData.songs;
        this.context.setPlaylist(contextPlaylists);
      })
  }

  playPlaylistSong(pos) {
    let songsArray = [...this.state.songs]
    this.props.playSinglePlaylist(songsArray, pos)
  }

  removePlaylistFromLibrary(playlist) {
    libraryService.removePlaylistFromLibrary(playlist._id)
      .then(data => {
        // Updtate the playlists context
        let playlists = [...this.context.playlists];
        const removedPlaylistIndex = playlistFuncs.getPlaylistIndex(playlist._id, playlists);
        playlists.splice(removedPlaylistIndex, 1);
        this.context.setPlaylist(playlists)
        // Update the libraryData context
        let newLibraryData = {...this.context.libraryData}
        let newLibraryDataPlaylists = newLibraryData.library.playlists;
        const removeLibraryDataPlaylist = newLibraryDataPlaylists.indexOf(playlist._id);
        newLibraryData.library.playlists.splice(removeLibraryDataPlaylist, 1);
        this.context.setLibrary(newLibraryData);
      })
  }

  addPlaylistToLibrary(playlist) {
    libraryService.addPlaylistToLibrary(playlist._id)
      .then(data => {
        // Updtate the playlists context
        let playlists = [...this.context.playlists];
        playlists.push(playlist);
        this.context.setPlaylist(playlists);
        // Update the library data
        let newLibraryData = {...this.context.libraryData}
        let newLibraryDataPlaylists = newLibraryData.library.playlists;
        newLibraryDataPlaylists.push(playlist._id);
        newLibraryData.library.playlists = newLibraryDataPlaylists;
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
        // It's possible that you can add a song to the same playlist you are on
        // Call the getSongPLaylistData to re render page if you are adding to the same playlist
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
      // A playlist can have the same song more than once so ntter to use uuidv4 as a key
      let uniqueKey = uuidv4();
      return <EnhancedSongRow 
                data={currentSong} 
                key={uniqueKey} 
                pos={i} 
                playPlaylistSong={this.playPlaylistSong} 
                playNext={this.playNext} 
                addToQueue={this.addToQueue} 
                removeFromPlaylist={this.removeFromPlaylist}
                removeFromLibrary={this.removeSongFromLibrary}
                addToLibrary={this.addSongToLibrary}
                addToPlaylist={this.addSongToPlaylist} 
                playlist={this.state.playlist} 
                addToLikedSongs={this.addToLikedSongs}
                removeFromLikedSongs={this.removeFromLikedSongs}
                popUpPage="playlistPage"
                page="playlistPage"
                handleOpenCreatePlaylistModal={this.handleOpenCreatePlaylistModal}
              />
    })
  }

  playlistHeader() {
    return <PlaylistHeader 
            playlist={this.state.playlist} 
            shufflePlay={this.shufflePlay} 
            playNext={this.playNext} 
            addToQueue={this.addToQueue} 
            deletePlaylist={this.deletePlaylist} 
            addToPlaylist={this.addToPlaylist}
            addToLibrary={this.addAlbumToLibrary}
            removeFromLibrary={this.removeAlbumFromLibrary}
            getPlaylistSongData={this.getPlaylistSongData} 
            handleOpenCreatePlaylistModal={this.handleOpenCreatePlaylistModal}
          />
  }

  render() {
    return (
      <div className="container main-container">
        {/* Playlist Head Start */}
        {this.playlistHeader()}

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

export default PlaylistPage;