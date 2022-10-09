import React, { Component } from 'react';
import MyContext from "../../context/authContext";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Link } from 'react-router-dom';

class SongPopUp extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      anchorPlaylistEl: null
    };

    this.handleAddToPlaylistClick = this.handleAddToPlaylistClick.bind(this);
    this.setAnchorPlaylistEl = this.setAnchorPlaylistEl.bind(this);
    this.addOrRemoveFromLibraryMenuItem = this.addOrRemoveFromLibraryMenuItem.bind(this);
    this.handleAddToPlaylistClose = this.handleAddToPlaylistClose.bind(this);
    this.playlistRows = this.playlistRows.bind(this);
    this.addToPlaylistClick = this.addToPlaylistClick.bind(this);
    this.createNewPlaylistClick = this.createNewPlaylistClick.bind(this);

    this.addToPlaylistMenuItem = this.addToPlaylistMenuItem.bind(this);
    this.removeFromPlaylistMenuItem = this.removeFromPlaylistMenuItem.bind(this);
    this.addToLikedSongsMenuItem = this.addToLikedSongsMenuItem.bind(this);
    this.removeFromQueueMenuItem = this.removeFromQueueMenuItem.bind(this);
    this.gotToAlbumMenuItem = this.gotToAlbumMenuItem.bind(this);
    this.goToArtistMenuItem = this.goToArtistMenuItem.bind(this);
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
    this.props.addToPlaylist(this.props.song._id, playlistId);
  }

  createNewPlaylistClick() {
    this.handleAddToPlaylistClose();
    this.props.handleOpenCreatePlaylistModal(this.props.song._id);
  }

  addOrRemoveFromLibraryMenuItem() {
    // Edge case if you added an album, you can't remove the songs from your library individually
    if (this.context.isAuthenticated){
      let librarySongsArray = this.context.libraryData.library.songs;
      if (librarySongsArray.includes(this.props.songId)) {
        return <MenuItem onClick={() => {this.props.removeFromLibraryClick()}}>Remove from library</MenuItem>;
      } else {
        return <MenuItem onClick={() => {this.props.addToLibraryClick()}}>Add to library</MenuItem>;
      }
    } else {
      return null;
    }
  }

  addToLikedSongsMenuItem() {
    if (this.context.isAuthenticated && (this.props.popUpPage === "homePage" || this.props.popUpPage === "controlsPage" || this.props.popUpPage === "searchResultsPage")) {
      let likedSongsArray = this.context.likedPlaylist.songs;
      if (likedSongsArray.includes(this.props.songId)) {
        return <MenuItem onClick={() => {this.props.removeFromLikedPlaylistClick()}}>Remove from liked songs</MenuItem>
      } else {
        return <MenuItem onClick={() => {this.props.addToLikedPlaylistClick()}}>Add to liked songs</MenuItem>;
      }
    } else {
      return null;
    }
  }

  addToPlaylistMenuItem() {
    if (this.context.isAuthenticated) {
      return <MenuItem onClick={this.handleAddToPlaylistClick}>Add to playlist</MenuItem>;
    } else {
      return null;
    }
  }

  removeFromPlaylistMenuItem() {
    if (this.context.isAuthenticated) {
      if (this.props.popUpPage === "playlistPage") {
        if (this.props.playlist.owner === this.context.userId && this.props.playlist.name !== "Your Likes") {
          return <MenuItem onClick={() => {this.props.removeFromPlaylistClick()}}>Remove from playlist</MenuItem>;
        }
      }
    }
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

  removeFromQueueMenuItem() {
    if (this.props.popUpPage === "controlsPage") {
      return <MenuItem onClick={() => {this.props.removeFromQueueClick()}}>Remove from queue</MenuItem>
    } else {
      return null;
    }
  }

  gotToAlbumMenuItem() {
    // Runs when song prop is loaded
    if (this.props.song){
      if (this.props.popUpPage !== "albumPage" && this.props.song.album) {
        return <Link to={"/album/" + this.props.song.album}><MenuItem onClick={() => {this.props.handleClose()}}>Go to album</MenuItem></Link>
      }
    }
  }

  goToArtistMenuItem() {
    if (this.props.song){
      if (this.props.popUpPage !== "albumPage" && this.props.popUpPage !== "artistPage") {
        return <Link to={"/artist/" + this.props.song.artist._id}><MenuItem onClick={() => {this.props.handleClose()}}>Go to artist</MenuItem></Link>
      }
    }
  }

  createNewPlaylistMenuItem() {
    if (this.context.isAuthenticated) {
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
          <MenuItem onClick={() => {this.props.playNextClick()}}>Play next</MenuItem>
          <MenuItem onClick={() => {this.props.addToQueueClick()}}>Add to queue</MenuItem>
          {this.addOrRemoveFromLibraryMenuItem()}
          {this.addToLikedSongsMenuItem()}
          {this.addToPlaylistMenuItem()}
          {this.removeFromPlaylistMenuItem()}
          {this.removeFromQueueMenuItem()}
          {this.gotToAlbumMenuItem()}
          {this.goToArtistMenuItem()}
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

export default SongPopUp;