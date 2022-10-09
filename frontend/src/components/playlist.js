import React, {Component} from 'react';
import PlaylistPopUp from './PopUpMenu/playlistPopUp';
import MyContext from "../context/authContext";
import ItemDisplay from './itemDisplay';
import ItemWithFeatures from './HOC/item';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import playlistFuncs from '../utils/playlistFunc';

class Playlist extends Component {
  static contextType = MyContext;
  constructor (props) {
    super(props);
    this.state = {
      deletePlaylistModalOpen: false,
      addToPlaylistSnackBarOpen: false,
      updatePlaylistModalOpen: false,
      migratePlaylistId: "",
      updatedPlaylist: {name: "", public: ""},
    }
    
    // Delete playlist modal
    this.deletePlaylistModalOpen = this.deletePlaylistModalOpen.bind(this);
    this.deletePlaylistModalClose = this.deletePlaylistModalClose.bind(this);
    this.deletePlaylistClick = this.deletePlaylistClick.bind(this);

    // Add to playlist snackbar 
    this.checkAddToPlaylistDuplicates = this.checkAddToPlaylistDuplicates.bind(this);
    this.addToPlaylistSnackBarClick = this.addToPlaylistSnackBarClick.bind(this);
    this.addToPlaylistSnackBarClose = this.addToPlaylistSnackBarClose.bind(this);
    this.handleAddToPlaylistDuplicates = this.handleAddToPlaylistDuplicates.bind(this);

    // For update playlist modal
    this.updatePlaylistModalClick = this.updatePlaylistModalClick.bind(this);
    this.updatePlaylistModalClose = this.updatePlaylistModalClose.bind(this);
    this.handleUpdatePlaylistTitle = this.handleUpdatePlaylistTitle.bind(this);
    this.handleUpdatePlaylistPublic = this.handleUpdatePlaylistPublic.bind(this);
    this.submitUpdatedPlaylistClick = this.submitUpdatedPlaylistClick.bind(this);

    // Menu options
    this.shufflePlayClick = this.shufflePlayClick.bind(this);
  }

  componentDidMount() {
    let publicType = this.props.data.public ? "public" : "private";
    this.setState({
      updatedPlaylist: {name: this.props.data.name, public: publicType}
    })
  }

  shufflePlayClick() {
    this.props.shufflePlay(this.props.data);
    this.props.handleClose();
  }

  deletePlaylistModalOpen() {
    this.props.handleClose();
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
    this.props.deletePlaylist(this.props.data._id);
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

  updatePlaylistModalClick() {
    this.props.handleClose();
    this.setState({
      updatePlaylistModalOpen: true,
    })
  }

  updatePlaylistModalClose() {
    this.setState({
      updatePlaylistModalOpen: false,
    })
  }

  submitUpdatedPlaylistClick() {
    this.updatePlaylistModalClose();
    let publicType = this.state.updatedPlaylist.public === "public"
    let updatedPlaylistData = {name: this.state.updatedPlaylist.name, public: publicType}
    this.props.updatePlaylist(this.props.data._id, updatedPlaylistData)
  }

  handleUpdatePlaylistTitle(e) {
    let updatedPlaylist = {...this.updatedPlaylist};
    updatedPlaylist.name = e.target.value;
    this.setState({
      updatedPlaylist: updatedPlaylist
    })
  }

  handleUpdatePlaylistPublic(e) {
    let updatedPlaylist = {...this.updatedPlaylist};

    updatedPlaylist.public = e.target.value === "public" ? "public" : "private";
    this.setState({
      updatedPlaylist: updatedPlaylist
    })
  }

  render() {
    return (
      <div className="col-3">
        <ItemDisplay
          item={this.props.data}
          artist=""
          artistId=""
          artistName=""
          itemTitle={this.props.data.name}
          handleClick={this.props.handleClick}
          imgStyle={this.props.imgStyle}
          page={this.props.page}
          typeItem="Playlist"
        />
        <PlaylistPopUp 
          {...this.props}
          playlistId={this.props.data._id} 
          playlist={this.props.data} 
          deletePlaylistModalOpen={this.deletePlaylistModalOpen}
          updatePlaylistModalClick={this.updatePlaylistModalClick} 
          shufflePlayClick={this.shufflePlayClick}
          handleOpenCreatePlaylistModal={this.props.handleOpenCreatePlaylistModal}
          popUpPage={this.props.popUpPage}
          checkAddToPlaylistDuplicates={this.checkAddToPlaylistDuplicates}
        />
        <Modal
          open={this.state.deletePlaylistModalOpen}
          onClose={this.deletePlaylistModalClose}
        >
          <div className="create-modal">
            <h2 className="white-txt">Delete playlist</h2>
            <h6 className="white-txt">Are your sure you want to delete this playlist?</h6>
            <h5 onClick={this.deletePlaylistModalClose} className="white-txt">Cancel</h5>
            <h5 onClick={this.deletePlaylistClick} className="white-txt">Delete</h5>
          </div>
        </Modal>
        <Modal
          open={this.state.updatePlaylistModalOpen}
          onClose={this.updatePlaylistModalClose}
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
              <button className="btn btn-primary btn-lg" onClick={this.updatePlaylistModalClose}>Cancel</button>
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
          autoHideDuration={9000}
          onClose={this.addToPlaylistSnackBarClose}
          message="Duplicates detected"
          action={
            <React.Fragment>
              <Button color="secondary" size="small" onClick={() => {this.handleAddToPlaylistDuplicates("Add Anyway")}}>
                Add anyway
              </Button>
              <Button color="secondary" size="small" onClick={() => {this.handleAddToPlaylistDuplicates("Skip Duplicates")}}>
                Skip duplicates
              </Button>
            </React.Fragment>
          }
        />
      </div>
    )
  }
}

const EnhancedPlaylist = ItemWithFeatures(Playlist);

export default EnhancedPlaylist;