import React, { Component } from 'react';
import $ from 'jquery'
import slider from 'jquery-ui/ui/widgets/slider'
import libraryService from '../services/libraryService';
import MyContext from "../context/authContext";
import SongPopUp from './PopUpMenu/songPopUp';
import playlistFuncs from '../utils/playlistFunc';
import Modal from '@material-ui/core/Modal';

export default class Controls extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      volumeBtnClass: "volumeBtn-active",
      muteBtnClass: "muteBtn-inactive",
      repeatBtnClass: "repeatBtn-inactive",
      repeatBtnToggle: false,
      anchorEl: null,
      newPlaylist: {name: "", public: false, songsAmount: "0", totalDuration: "0", songs: []},
      showCreatePlaylistModal: false,
    }
    // Controls methods
    this.clickPauseBtn = this.clickPauseBtn.bind(this);
    this.clickPlayBtn = this.clickPlayBtn.bind(this);
    this.changeVolumeBtn = this.changeVolumeBtn.bind(this);
    this.changeMutetoVolumeBtn = this.changeMutetoVolumeBtn.bind(this);
    this.clickToggleMute = this.clickToggleMute.bind(this);
    this.clickToggleVolume = this.clickToggleVolume.bind(this);
    this.repeatBtnClick = this.repeatBtnClick.bind(this);
    this.shuffleBtnClick = this.shuffleBtnClick.bind(this);
    this.nextBtnClick = this.nextBtnClick.bind(this);
    this.prevBtnClick = this.prevBtnClick.bind(this);
    this.thumbsUpClick = this.thumbsUpClick.bind(this);
    this.thumbsDownClick = this.thumbsDownClick.bind(this);

    // Popup menu
    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.setAnchorEl = this.setAnchorEl.bind(this);
    
    // Menu
    this.playNextClick = this.playNextClick.bind(this);
    this.addToQueueClick = this.addToQueueClick.bind(this);
    this.addToLibraryClick = this.addToLibraryClick.bind(this);
    this.removeFromLibraryClick = this.removeFromLibraryClick.bind(this);
    this.addSongToPlaylist = this.addSongToPlaylist.bind(this);
    this.removeFromQueueClick = this.removeFromQueueClick.bind(this);
    this.addToLikedPlaylistClick = this.addToLikedPlaylistClick.bind(this);
    this.removeFromLikedPlaylistClick = this.removeFromLikedPlaylistClick.bind(this);

    this.isLiked = this.isLiked.bind(this);

    // Create new playlist modal
    this.handleOpenCreatePlaylistModal = this.handleOpenCreatePlaylistModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.onChangeNewPlaylistName = this.onChangeNewPlaylistName.bind(this);
    this.onChangeNewPlaylistPrivacy = this.onChangeNewPlaylistPrivacy.bind(this);
    this.onSubmitNewPlaylistForm = this.onSubmitNewPlaylistForm.bind(this);
    this.resetForm = this.resetForm.bind(this);
  }

  componentDidMount() {
    $('#timeSlider').slider({
      min: 0,
      max: 100,
      value: 0,
      range: "min",
    });

    $("#timeSlider").on("slide", (event, ui) => {
      console.log('You are sliding');
      this.props.player.is_sliding = true;
      this.props.scrubTimer(ui.value);
    });

    $("#timeSlider").on("slidestop", (event, ui) => {
      console.log('you finished sliding');
      console.log(ui.value);
      this.props.player.is_sliding = false;
      this.props.player.seek(ui.value);
    })

    $("#volume").slider({
      min: 0,
      max: 100,
      value: 100,
      range: "min",
    });
    $('#volume').on("slide", (event, ui) => {
      console.log(ui.value);
      console.log("slide vol occured")
      this.props.player.volume(ui.value / 100);
      this.changeVolumeBtn(ui.value);
      this.changeMutetoVolumeBtn(ui.value);
    })
    $("#volume").on("slidechange", (event, ui) => {
      console.log("slide change occured")
      console.log(ui.value);
      this.props.player.volume(ui.value / 100);
    })
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

  playNextClick() {
    this.props.playNext(this.props.song)
    this.handleClose();

  }

  addToQueueClick() {
    this.props.addToQueue(this.props.song)
    this.handleClose();

  }

  addToLibraryClick() {
    // In the future create a little message pop up that shows its been added
    // Will need to add it after promise
    libraryService.addSongToLibrary(this.props.currentSong._id)
      .then(data => {
        let libraryData = {...this.context.libraryData};
        libraryData.library.songs.push(this.props.currentSong._id);
        this.context.setLibrary(libraryData);
      })
    this.handleClose();
  }

  removeFromLibraryClick() {
    libraryService.removeSongFromLibrary(this.props.currentSong._id)
      .then(data => {
        let libraryData = {...this.context.libraryData};
        const removedSongIndex = libraryData.library.songs.indexOf(this.props.currentSong._id);
        libraryData.library.songs.splice(removedSongIndex, 1);
        this.context.setLibrary(libraryData);
      })
    this.handleClose();
  }

  addToPlaylist(playlistId) {
    libraryService.addToPlaylist(this.props.currentSong._id, playlistId)
      .then(updatedData => {
        let contextPlaylists = [...this.context.playlists];
        let playlistIndex = playlistFuncs.getPlaylistIndex(playlistId, contextPlaylists);
        contextPlaylists[playlistIndex].songs = updatedData.songs;
        this.context.setPlaylist(contextPlaylists);
      })
  }

  addToLikedPlaylistClick() {
    this.handleClose();
    libraryService.addToLikedPlaylist(this.props.currentSong._id)
      .then(data => {
        if (data.songAddedToLibrary) {
          let libraryData = {...this.context.libraryData};
          libraryData.library.songs.push(this.props.currentSong._id);
          this.context.setLibrary(libraryData);
        }
        let likedPlaylistData = {...this.context.likedPlaylist};
        likedPlaylistData.songs.push(this.props.currentSong._id);
        this.context.setLikedPlaylist(likedPlaylistData);
      })
  }

  removeFromLikedPlaylistClick() {
    this.handleClose();
    libraryService.removeFromPlaylist(this.props.currentSong._id, this.context.likedPlaylist._id)
      .then(data => {
        let likedPlaylistData = {...this.context.likedPlaylist};
        const removedSongIndex = likedPlaylistData.songs.indexOf(this.props.currentSong._id);
        likedPlaylistData.songs.splice(removedSongIndex, 1);
        this.context.setLikedPlaylist(likedPlaylistData);
      })
  }

  clickToggleVolume() {
    this.setState({
      volumeBtnClass: "volumeBtn-active",
      muteBtnClass: "muteBtn-inactive",
    })
    $("#volume").slider("value", 100)
  }

  clickToggleMute() {
    this.setState({
      volumeBtnClass: "volumeBtn-inactive",
      muteBtnClass: "muteBtn-active",
    })
    $("#volume").slider("value", 0)
  }

  changeVolumeBtn(val) {
    if (val == 0){
      this.setState({
        volumeBtnClass: "volumeBtn-inactive",
        muteBtnClass: "muteBtn-active",
      });
    }
  }

  clickPauseBtn() {
    this.props.player.pause();
    this.props.showPlayBtn();
  }

  clickPlayBtn() {
    this.props.player.play();
    this.props.showPauseBtn();
  }

  changeMutetoVolumeBtn(val) {
    if (this.state.volumeBtnClass === "volumeBtn-inactive" && val > 0) {
      this.setState({
        muteBtnClass: "muteBtn-inactive",
        volumeBtnClass: "volumeBtn-active",
      });
    }
  }

  prevBtnClick() {
    this.props.skipSong("prev");
  }

  nextBtnClick() {
    this.props.skipSong("next")
  }

  shuffleBtnClick() {
    this.props.shuffleQueue();
  }

  repeatBtnClick() {
    console.log("repeat btn clicked")
    if (this.state.repeatBtnToggle) {
      this.setState({
        repeatBtnClass: "repeatBtn-inactive",
        repeatBtnToggle: false,
      })
      this.props.player.repeat(false);
    } else {
      this.setState({
        repeatBtnClass: "repeatBtn-active",
        repeatBtnToggle: true,
      })
      this.props.player.repeat(true);
    }
  }
  
  thumbsUpClick() {
    if (this.context.isAuthenticated) {
      let likedPlaylistData = {...this.context.likedPlaylist};
      let likedSongsArray = [...this.context.likedPlaylist.songs];

      if (!likedSongsArray.includes(this.props.currentSong._id)) {
        // Change liked playlist context
        libraryService.addToLikedPlaylist(this.props.currentSong._id)
          .then(data => {
            if (data.songAddedToLibrary) {
              let libraryData = {...this.context.libraryData};
              libraryData.library.songs.push(this.props.currentSong._id);
              this.context.setLibrary(libraryData);
            }
            likedPlaylistData.songs.push(this.props.currentSong._id);
            this.context.setLikedPlaylist(likedPlaylistData);
          })
      } else {
        // Change liked playlist context
        libraryService.removeFromPlaylist(this.props.currentSong._id, likedPlaylistData._id)
          .then(data => {
            // Change liked playlist context
            const removedSongIndex = likedPlaylistData.songs.indexOf(this.props.currentSong._id);
            likedPlaylistData.songs.splice(removedSongIndex, 1);
            this.context.setLikedPlaylist(likedPlaylistData);
          })
      }
    }
  }

  thumbsDownClick() {
    if (this.context.isAuthenticated) {
      let likedPlaylistData = {...this.context.likedPlaylist};
      let likedSongsArray = [...this.context.likedPlaylist.songs];
      if (likedSongsArray.includes(this.props.currentSong._id)) {
        libraryService.removeFromPlaylist(this.props.currentSong._id, likedPlaylistData._id)
          .then(data => {
            // Change liked playlist context
            const removedSongIndex = likedPlaylistData.songs.indexOf(this.props.currentSong._id);
            likedPlaylistData.songs.splice(removedSongIndex, 1);
            this.context.setLikedPlaylist(likedPlaylistData);
          })
      }
    }
    this.removeFromQueueClick();
  }

  removeFromQueueClick() {
    this.props.removeFromQueue(this.props.currentPos);
    this.handleClose();
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

  isLiked() {
    if (this.context.isAuthenticated && this.props.currentSong.title) {
      if (this.context.likedPlaylist.songs.includes(this.props.currentSong._id)) {
        return (
          <i className={`fas fa-thumbs-up thumbs-up-active`} id="like" onClick={() => {this.thumbsUpClick()}}></i>
        );
      } else {
        return (
          <i className={`fas fa-thumbs-up thumbs-up-inactive`} id="like" onClick={() => {this.thumbsUpClick()}}></i>
        );
      }
    } else {
      return (
        <i className={`fas fa-thumbs-up thumbs-up-inactive`} id="like"></i>
      )
    }
  }

  render() {
    return (
      <div className="row controls-container">
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
        <div className="col-12 time-slider-wrapper">
          <div id="timeSlider"></div>
        </div>
        <div className="col-1 play-controls">
          <i className="fas fa-step-backward" id="prevBtn" onClick={() => {this.prevBtnClick()}}></i>
          <i className={`fas fa-play ${this.props.playBtnClass}`} id="" onClick={() => {this.clickPlayBtn()}}></i>
          <i className={`fas fa-pause control-btn ${this.props.pauseBtnClass}`} id="" onClick={() => {this.clickPauseBtn()}}></i>
          <i className="fas fa-step-forward" id="nextBtn" onClick={() => {this.nextBtnClick()}}></i>
        </div>
        <div className="col-1 time-wrapper">
          <h6 id="timer">{this.props.currentTimer}</h6>
          <h6>/</h6>
          <h6 id="duration">{this.props.trueSongDuration}</h6>
        </div>
        <div className="col-6 controls-current-song-container">
          <div className="controls-img-wrapper">
            <img className="img-fluid" src={this.props.currentSong.image} id="controlsImg"/>
          </div>
          <div className="controls-main-title">
            <h5 id="title">{this.props.currentSong.title}</h5>
            <h5 id="artist">{this.props.currentSong.artist.name}</h5>
          </div>
          <i className="fas fa-thumbs-down" id="dislike" onClick={() => {this.thumbsDownClick()}}></i>
          {this.isLiked()}
          <i className="fas fa-ellipsis-v" id="songOptions" onClick={this.handleClick}></i>
        </div>
        <div className="col-2">
          <div className="volume-container">
            <div id="volume"></div>
          </div>
          <i className={`fas fa-volume-up ${this.state.volumeBtnClass}`} id="volumeBtn" onClick={() => {this.clickToggleMute()}}></i>
          <i className={`fas fa-volume-mute control-btn ${this.state.muteBtnClass}`} id="muteBtn" onClick={() => {this.clickToggleVolume()}}></i>
        </div>
        <div className="col-2">
          <i className={`fas fa-redo ${this.state.repeatBtnClass}`} id="repeatBtn" onClick={() => {this.repeatBtnClick()}}></i>
          <i className="fas fa-random" id="shuffleBtn" onClick={() => {this.shuffleBtnClick()}}></i>
          <i className="fas fa-sort-down" id="showPlayer" onClick={() => {this.props.slidePlayerBtnClick()}}></i>
        </div>
        <SongPopUp 
          anchorEl={this.state.anchorEl} 
          setAnchorEl={this.setAnchorEl} 
          playNextClick={this.playNextClick} 
          addToQueueClick={this.addToQueueClick} 
          addToLibraryClick={this.addToLibraryClick} 
          removeFromLibraryClick={this.removeFromLibraryClick} 
          addToPlaylist={this.addSongToPlaylist} 
          handleClose={this.handleClose} 
          songId={this.props.currentSong._id}
          song={this.props.currentSong}
          addToLikedPlaylistClick={this.addToLikedPlaylistClick}
          removeFromLikedPlaylistClick={this.removeFromLikedPlaylistClick} 
          removeFromQueueClick={this.removeFromQueueClick}
          popUpPage="controlsPage"
          handleOpenCreatePlaylistModal={this.handleOpenCreatePlaylistModal}
        />
      </div>
    )
  }
}