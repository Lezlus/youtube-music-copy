import React, { Component } from 'react';
import libraryService from '../../services/libraryService';
import PlaylistPopUp from '../PopUpMenu/playlistPopUp';
import SongPopUp from '../PopUpMenu/songPopUp';
import MyContext from "../../context/authContext";
import playlistFuncs from '../../utils/playlistFunc';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
  Redirect,
  useRouteMatch
} from "react-router-dom";
import ReactModal from 'react-modal';
import getSongDataService from '../../services/getData';
import EnhancedPlaylist from '../playlist';

class LibraryPlaylistSection extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);

    this.getPlaylistData = this.getPlaylistData.bind(this);
    this.playlistImageClick = this.playlistImageClick.bind(this);
    this.addToQueue = this.addToQueue.bind(this);
    this.playNext = this.playNext.bind(this);
    this.shufflePlay = this.shufflePlay.bind(this);

    this.removePlaylistFromLibrary = this.removePlaylistFromLibrary.bind(this);
    this.addToPlaylist = this.addToPlaylist.bind(this);
    this.deletePlaylist = this.deletePlaylist.bind(this);
  }

  async getPlaylistData(playlistObj) {
    const playlistData = await getSongDataService.getPlaylistData(playlistObj._id);
    return playlistData.songs;
  }

  playlistImageClick(playlistObj) {
    this.getPlaylistData(playlistObj)
      .then(data => {
        this.props.playSinglePlaylist(data);
      })
      .catch(error => {
        console.log(error);
      })
  }

  addToQueue(songObj) {
    if (songObj.typeItem === "Playlist") {
      this.getPlaylistData(songObj)
        .then(data => {
          this.props.addToQueueNewQueueSong(data);
        })
        .catch(error => {
          console.log(error);
        })
    } else {
        this.props.addToQueueNewQueueSong(songObj);
        console.log("added to queue")
    }
  }

  playNext(songObj) {
    if (songObj.typeItem === "Playlist") {
      this.getPlaylistData(songObj)
        .then(data => {
          this.props.playNextQueueSong(data, this.props.currentSongIndex);
        })
        .catch(error => {
          console.log(error);
        })
    } else {
      this.props.playNextQueueSong(songObj, this.props.currentSongIndex);
      console.log("Play Next");
    }
  }

  shufflePlay(playlistObj) {
    this.getPlaylistData(playlistObj)
      .then(data => {
        this.props.shufflePlayCollection(data);
      })
      .catch(error => {
        console.log(error);
      })
  }

  libraryPlaylistList() {
    let i = -1;
    return this.props.playlists.map(playlist => {
      let owner = playlist.owner ? playlist.owner._id : null;
      i++
      return <EnhancedPlaylist 
              data={playlist} 
              key={playlist._id} 
              playlistOwner={owner}
              playlistImageClick={this.playlistImageClick} 
              addToQueue={this.addToQueue} 
              playNext={this.playNext}
              shufflePlay={this.shufflePlay}
              removeFromLibrary={this.removePlaylistFromLibrary}
              addToPlaylist={this.addToPlaylist}
              deletePlaylist={this.deletePlaylist}
              page="libraryPage"
              popUpPage="libraryPage"
              imgStyle="playlist-img-wrapper library"
              handleOpenCreatePlaylistModal={this.props.handleOpenCreatePlaylistModal}
            />;
    }) 
  }

  removePlaylistFromLibrary(playlist) {
    libraryService.removePlaylistFromLibrary(playlist._id)
      .then(data => {
        this.props.getPlaylistLibraryData()
          // Change libraryData context
          let libraryData = {...this.context.libraryData};
          const removedPlaylistIndex = libraryData.library.playlists.indexOf(playlist._id);
          libraryData.library.playlists.splice(removedPlaylistIndex);
          this.context.setLibrary(libraryData);
          // Change playlists context
          let playlists = [...this.context.playlists];
          const playlistToRemoveIdx = playlistFuncs.getPlaylistIndex(playlist._id, playlists);
          playlists.splice(playlistToRemoveIdx);
          this.context.setPlaylist(playlists);
      })
  }

  addToPlaylist(playlistId, data) {
    libraryService.addPlaylistToPlaylist(playlistId, data)
      .then(updatedData => {
        let contextPlaylists = [...this.context.playlists];
        let playlistIndex = playlistFuncs.getPlaylistIndex(playlistId, contextPlaylists);
        contextPlaylists[playlistIndex].songs = updatedData.songs;
        this.context.setPlaylist(contextPlaylists);
        this.props.getPlaylistLibraryData()
      })
  }

  deletePlaylist(playlistId) {
    libraryService.deletePlaylist(playlistId)
      .then(data => {
        // Change playlists context
        let playlistsArray = [...this.context.playlists];
        const playlistToDeleteIndex = playlistFuncs.getPlaylistIndex(playlistId, playlistsArray);
        playlistsArray.splice(playlistToDeleteIndex, 1);
        this.context.setPlaylist(playlistsArray);
        // Change library data context
        let libraryData = {...this.context.libraryData}
        let libraryPlaylistsArray = [...libraryData.library.playlists];
        const libraryPlaylistToDeleteIndex = libraryPlaylistsArray.indexOf(playlistId);
        libraryPlaylistsArray.splice(libraryPlaylistToDeleteIndex, 1);
        libraryData.library.playlists = libraryPlaylistsArray;
        this.context.setLibrary(libraryData);
        
        this.props.getPlaylistLibraryData()
      })
  }

  render() {
    return (
      <div className="row playlist-container">
        <div className="col-3">
          <div className="playlist-img-wrapper library">
            <img className="img-fluid" src="../song_images/create_playlist.png" alt="Create Playlist" onClick={() => {this.props.handleOpenCreatePlaylistModal()}}/>
          </div>
        </div>
        {this.libraryPlaylistList()}
      </div>
    )
  }
}

export default LibraryPlaylistSection