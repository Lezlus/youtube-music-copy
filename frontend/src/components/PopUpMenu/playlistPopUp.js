import React, { Component } from 'react';
import MyContext from "../../context/authContext";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

class PlaylistPopUp extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      anchorPlaylistEl: null
    };

    this.handleAddToPlaylistClick = this.handleAddToPlaylistClick.bind(this);
    this.setAnchorPlaylistEl = this.setAnchorPlaylistEl.bind(this);
    this.handleAddToPlaylistClose = this.handleAddToPlaylistClose.bind(this);
    this.playlistRows = this.playlistRows.bind(this);
    this.addToPlaylistClick = this.addToPlaylistClick.bind(this);
    this.createNewPlaylistClick = this.createNewPlaylistClick.bind(this);

    this.shufflePlayMenuItem = this.shufflePlayMenuItem.bind(this);
    this.addToPlaylistMenuItem = this.addToPlaylistMenuItem.bind(this);
    this.deletePlaylistMenuItem = this.deletePlaylistMenuItem.bind(this);
    this.removeOrAddPlaylistFromLibraryMenuItem = this.removeOrAddPlaylistFromLibraryMenuItem.bind(this);
    this.editPlaylistMenuItem = this.editPlaylistMenuItem.bind(this);
    this.createNewPlaylistMenuItem = this.createNewPlaylistMenuItem.bind(this);
  }

  handleAddToPlaylistClick(event) {
    this.props.handleClose();
    this.setAnchorPlaylistEl(event.currentTarget);
  }

  handleAddToPlaylistClose() {
    this.setAnchorPlaylistEl(null)
  }

  setAnchorPlaylistEl(val) {
    this.setState({
      anchorPlaylistEl: val
    })
  }

  addToPlaylistClick(playlistId) {
    this.handleAddToPlaylistClose();
    this.props.checkAddToPlaylistDuplicates(playlistId);
  }
  
  createNewPlaylistClick() {
    let songsIdArray = [];
    if (this.props.popUpPage === "playlistPage") {
      for (let i=0; i<this.props.playlist.songs.length; i++) {
        songsIdArray.push(this.props.playlist.songs[i]._id);
      }
    } else {
      songsIdArray = this.props.playlist.songs;
    }
    this.handleAddToPlaylistClose();
    this.props.handleOpenCreatePlaylistModal(songsIdArray);
  }

  addToPlaylistMenuItem() {
    if (this.context.isAuthenticated) {
      if (this.props.playlist.name !== "Your Likes") {
        return <MenuItem onClick={this.handleAddToPlaylistClick}>Add to playlist</MenuItem>;
      }
    }
    return null;
  }

  playlistRows() {
    if (this.context.isAuthenticated) {

      let playlistsArray = this.context.playlists;
      return playlistsArray.map(playlist => {
        return <MenuItem key={playlist._id} onClick={() => {this.addToPlaylistClick(playlist._id)}}>{playlist.name}</MenuItem>;
      });
    } else {
      return null;
    }
  }

  deletePlaylistMenuItem() {
    if (this.props.playlistOwner === this.context.userId && this.props.playlist.name !== "Your Likes") {
      return <MenuItem onClick={() => {this.props.deletePlaylistModalOpen()}}>Delete playlist</MenuItem>;
    }
  }

  editPlaylistMenuItem() {
    if (this.props.playlistOwner === this.context.userId && this.props.playlist.name !== "Your Likes" && this.props.popUpPage !== "playlistPage") {
      return <MenuItem onClick={() => {this.props.updatePlaylistModalClick()}}>Edit playlist</MenuItem>;
    }
  }

  removeOrAddPlaylistFromLibraryMenuItem() {
    let libraryPlaylists = this.context.libraryData.library.playlists;
    if (this.context.isAuthenticated && this.props.popUpPage !== "playlistPage") {
      if (this.props.playlistOwner !== this.context.userId && libraryPlaylists.includes(this.props.playlist._id)) {
        return <MenuItem onClick={() => {this.props.removeFromLibraryClick()}}>Remove playlist from library</MenuItem>
      }
      else if (this.props.playlistOwner !== this.context.userId) {
        return <MenuItem onClick={() => {this.props.addToLibraryClick()}}>Add playlist to library</MenuItem>
      }
    }
  }

  shufflePlayMenuItem() {
    if (this.props.popUpPage !== "playlistPage") {
      return <MenuItem onClick={() => {this.props.shufflePlayClick()}}>Shuffle play</MenuItem>
    }
  }

  createNewPlaylistMenuItem() {
    if (this.context.isAuthenticated && this.props.playlist.name !== "Your Likes") {
      return <MenuItem onClick={() => {this.createNewPlaylistClick()}}>New playlist</MenuItem>
    }
  }

  render() {
    return (
      <div>
        <Menu
          id="simple-menu"
          anchorEl={this.props.anchorEl}
          keepMounted
          open={Boolean(this.props.anchorEl)}
          onClose={this.props.handleClose}
        >
          {this.shufflePlayMenuItem()}
          {this.editPlaylistMenuItem()}
          <MenuItem onClick={() => {this.props.playNextClick()}}>Play next</MenuItem>
          <MenuItem onClick={() => {this.props.addToQueueClick()}}>Add to queue</MenuItem>
          {this.removeOrAddPlaylistFromLibraryMenuItem()}
          {this.addToPlaylistMenuItem()}
          {this.deletePlaylistMenuItem()}
        </Menu>
        <Menu
          id="addToPlaylistMenu"
          anchorEl={this.state.anchorPlaylistEl}
          keepMounted
          open={Boolean(this.state.anchorPlaylistEl)}
          onClose={this.handleAddToPlaylistClose}
        >
          {this.playlistRows()}
          {this.createNewPlaylistMenuItem()}
        </Menu>
      </div>
    )
  }
}

export default PlaylistPopUp