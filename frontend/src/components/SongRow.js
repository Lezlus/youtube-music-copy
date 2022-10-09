import React, { Component } from 'react';
import SongPopUp from './PopUpMenu/songPopUp';
import MyContext from "../context/authContext";
import libraryService from '../services/libraryService';
import ItemWithFeatures from './HOC/item';
import playlistFuncs from '../utils/playlistFunc';

class SongRow extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      thumbsDownClass: "thumbs-down-inactive",
    }
    // Menu options
    this.removeFromPlaylistClick = this.removeFromPlaylistClick.bind(this);
    this.songClick = this.songClick.bind(this);
    this.thumbsUpClick = this.thumbsUpClick.bind(this);
    this.thumbsDownClick = this.thumbsDownClick.bind(this);
    this.isLiked = this.isLiked.bind(this);
  }

  songClick() {
    this.props.playPlaylistSong(this.props.pos);
  }

  removeFromPlaylistClick() {
    this.props.handleClose();
    this.props.removeFromPlaylist(this.props.data._id, this.props.pos)
  }

  thumbsUpClick() {
    if (!(this.context.likedPlaylist.songs.includes(this.props.data._id))) {
      this.props.addToLikedSongs(this.props.data._id);

    } else {
      this.props.removeFromLikedSongs(this.props.data._id);
    }
    this.setState({
      thumbsDownClass: "thumbs-down-inactive",
    })
  }

  thumbsDownClick() {
    let thumbsDownClass = this.state.thumbsDownClass === "thumbs-down-active" ? "thumbs-down-inactive" : "thumbs-down-active";
    if (thumbsDownClass === "thumbs-down-active" && this.context.likedPlaylist.songs.includes(this.props.data._id)) {
      this.props.removeFromLikedSongs(this.props.data._id);
    } 
    this.setState({
      thumbsDownClass: thumbsDownClass,
    })
  }

  isLiked() {
    if (this.context.isAuthenticated) {
      if (this.context.likedPlaylist.songs.includes(this.props.data._id)) {
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
      );
    }
  }

  render() {
    return (
      <div className="row playlist-song-row">
        <div className="col-1">
          <div className="playlist-song-row-img-wrapper">
            <img className="img-fluid playlist-song-row-img" src={this.props.data.image} alt={this.props.data.title} onClick={() => {this.songClick()}}/>
          </div>
        </div>
        <div className="col-3">
          <h4 className="white-txt playlist-song-row-txt" onClick={() => {this.songClick()}}>{this.props.data.title}</h4>
        </div>
        <div className="col-3">
          <h5 className="white-txt">{this.props.data.artist.name}</h5>
        </div>
        <div className="col-3">
          <i className={`fas fa-thumbs-down ${this.state.thumbsDownClass}`} id="dislike" onClick={() => {this.thumbsDownClick()}}></i>
          {this.isLiked()}
          <i className="fas fa-ellipsis-v playlist-song-options" onClick={this.props.handleClick}></i>
        </div>
        <div className="col-2">
          <h5 className="white-txt">{this.props.data.duration}</h5>
        </div>
        <SongPopUp 
          {...this.props}
          songId={this.props.data._id} 
          removeFromPlaylistClick={this.removeFromPlaylistClick}  
          playlist={this.props.playlist} 
          popUpPage={this.props.popUpPage}
          song={this.props.data}
          handleOpenCreatePlaylistModal={this.props.handleOpenCreatePlaylistModal}
        />
      </div>
    )
  }
}

const EnhancedSongRow = ItemWithFeatures(SongRow);
export default EnhancedSongRow;