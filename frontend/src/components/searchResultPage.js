import React, { Component } from 'react';
import searchService from '../services/searchService';
import Modal from '@material-ui/core/Modal';
import MyContext from "../context/authContext";
import { v4 as uuidv4 } from 'uuid';
import EnhancedSearchhResultSongRow from "./searchResultSongRow";
import libraryService from '../services/libraryService';
import playlistFuncs from '../utils/playlistFunc';

class SearchResultPage extends Component {
  static contextType = MyContext;
  constructor (props) {
    super(props);
    this.state = {
      songs: [],
      showCreatePlaylistModal: false,
      newPlaylist: {name: "", public: false, songsAmount: "0", totalDuration: "0", songs: []},
    }

    // Create new playlist modal
    this.handleOpenCreatePlaylistModal = this.handleOpenCreatePlaylistModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.onChangeNewPlaylistName = this.onChangeNewPlaylistName.bind(this);
    this.onChangeNewPlaylistPrivacy = this.onChangeNewPlaylistPrivacy.bind(this);
    this.onSubmitNewPlaylistForm = this.onSubmitNewPlaylistForm.bind(this);
    this.resetForm = this.resetForm.bind(this);

    this.getSearchQueryData = this.getSearchQueryData.bind(this);

    this.songImageClick = this.songImageClick.bind(this);
    this.addToQueue = this.addToQueue.bind(this);
    this.playNext = this.playNext.bind(this);
    this.addSongToLibrary = this.addSongToLibrary.bind(this);
    this.removeSongFromLibrary = this.removeSongFromLibrary.bind(this);
    this.addSongToPlaylist = this.addSongToPlaylist.bind(this);
    this.addToLikedSongs = this.addToLikedSongs.bind(this);
    this.removeFromLikedSongs = this.removeFromLikedSongs.bind(this);
  }

  componentDidMount() {
    let searchQuery = this.props.match.params.searchQuery;
    this.getSearchQueryData(searchQuery);
  }

  getSearchQueryData(searchQuery) { 
    searchService.getSearchQueryResults(searchQuery)
      .then(data => {
        this.setState({
          songs: data,
        })
      })
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

  songImageClick(songObj) {
    this.props.playSingleSong(songObj);
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
    return this.state.songs.map(currentSong => {
      let key = uuidv4();
      return <EnhancedSearchhResultSongRow 
                data={currentSong} 
                key={key} 
                songImageClick={this.songImageClick}
                addToQueue={this.addToQueue}
                playNext={this.playNext}
                removeFromLibrary={this.removeSongFromLibrary}
                addToLibrary={this.addSongToLibrary}
                addToPlaylist={this.addSongToPlaylist}
                page="searchResultsPage"
                popUpPage="searchResultsPage" 
                handleOpenCreatePlaylistModal={this.handleOpenCreatePlaylistModal}
            />;
    })
  }

  render() {
    return (
      <div className="container main-container">
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

export default SearchResultPage;