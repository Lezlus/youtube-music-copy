import React, {Component} from 'react';
import AlbumPopUp from './PopUpMenu/albumPopUp';
import MyContext from "../context/authContext";
import libraryService from '../services/libraryService';
import ItemDisplay from './itemDisplay';
import ItemWithFeatures from './HOC/item';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import playlistFuncs from '../utils/playlistFunc';


class Album extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      addToPlaylistSnackBarOpen: false,
      migratePlaylistId: "",
    }
    // Add to playlist snackbar 
    this.addToPlaylistSnackBarClick = this.addToPlaylistSnackBarClick.bind(this);
    this.addToPlaylistSnackBarClose = this.addToPlaylistSnackBarClose.bind(this);
    this.handleAddToPlaylistDuplicates = this.handleAddToPlaylistDuplicates.bind(this);
    this.checkAddToPlaylistDuplicates = this.checkAddToPlaylistDuplicates.bind(this);
    // Menu options
    this.shufflePlayClick = this.shufflePlayClick.bind(this);

  }

  shufflePlayClick() {
    this.props.shufflePlay(this.props.data);
    this.props.handleClose();
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
    let songIncluded = playlistFuncs.playlistSongInPlaylist(this.props.data.songs, contextPlaylists[playlistIndex].songs);
    if (songIncluded) {
      this.addToPlaylistSnackBarClick();
      this.setState({
        migratePlaylistId: playlistId,
      })
    } else {
      this.props.addToPlaylist(playlistId, {songs: this.props.data.songs, option: "Add Anyway"});
    }
  }

  handleAddToPlaylistDuplicates(option) {
    if (option === "Add Anyway") {
      this.props.addToPlaylist(this.state.migratePlaylistId, {songs: this.props.data.songs, option: "Add Anyway"});
    } else {
      this.props.addToPlaylist(this.state.migratePlaylistId,{songs: this.props.data.songs, option: "Skip Duplicates"});
    }
    this.setState({ 
      migratePlaylistId: "",
    })
    this.addToPlaylistSnackBarClose();
  }

  render() {
    return(
      <div className="col-3">
        <ItemDisplay
          item={this.props.data}
          artist={this.props.data.artist}
          artistId={this.props.data.artist._id}
          artistName={this.props.data.artist.name}
          itemTitle={this.props.data.name}
          handleClick={this.props.handleClick}
          imgStyle="playlist-img-wrapper"
          page={this.props.page}
          typeItem="Album"
        />
        <AlbumPopUp
          {...this.props}
          album={this.props.data}
          shufflePlayClick={this.shufflePlayClick} 
          checkAddToPlaylistDuplicates={this.checkAddToPlaylistDuplicates}
          popUpPage={this.props.popUpPage} 
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
    )
  }
}

const EnhancedAlbum = ItemWithFeatures(Album);

export default EnhancedAlbum;