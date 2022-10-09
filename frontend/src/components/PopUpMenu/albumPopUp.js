import React, { Component } from 'react';
import MyContext from "../../context/authContext";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Link } from 'react-router-dom';

export default class AlbumPopUp extends Component {
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
    this.addOrRemoveFromLibraryMenuItem = this.addOrRemoveFromLibraryMenuItem.bind(this);
    this.goToArtistPageMenuItem = this.goToArtistPageMenuItem.bind(this);
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
    if (this.props.popUpPage === "albumPage") {
      for (let i=0; i<this.props.album.songs.length; i++) {
        songsIdArray.push(this.props.album.songs[i]._id);
      }
    } else {
      songsIdArray = this.props.album.songs;
    }
    this.handleAddToPlaylistClose();
    this.props.handleOpenCreatePlaylistModal(songsIdArray);
  }


  addToPlaylistMenuItem() {
    if (this.context.isAuthenticated) {
      return <MenuItem onClick={this.handleAddToPlaylistClick}>Add to playlist</MenuItem>;
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

  shufflePlayMenuItem() {
    return <MenuItem onClick={() => {this.props.shufflePlayClick()}}>Shuffle play</MenuItem>
  }

  addOrRemoveFromLibraryMenuItem() {
    // Edge case if you added an album, you can't remove the songs from your library individually
    if (this.context.isAuthenticated && this.props.popUpPage !== "albumPage"){
      let libraryAlbumsArray = this.context.libraryData.library.albums;
      if (libraryAlbumsArray.includes(this.props.album._id)) {
        return <MenuItem onClick={() => {this.props.removeFromLibraryClick()}}>Remove album from library</MenuItem>;
      } else {
        return <MenuItem onClick={() => {this.props.addToLibraryClick()}}>Add album to library</MenuItem>;
      }
    } else {
      return null;
    }
  }

  goToArtistPageMenuItem() {
    if (this.props.popUpPage === "homePage"){
      return <Link to={"/artist/" + this.props.album.artist}><MenuItem onClick={() => {this.props.handleClose()}}>Go to artist</MenuItem></Link>
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
          {this.shufflePlayMenuItem()}
          <MenuItem onClick={() => {this.props.playNextClick()}}>Play next</MenuItem>
          <MenuItem onClick={() => {this.props.addToQueueClick()}}>Add to queue</MenuItem>
          {this.addOrRemoveFromLibraryMenuItem()}
          {this.addToPlaylistMenuItem()}
          {this.goToArtistPageMenuItem()}
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