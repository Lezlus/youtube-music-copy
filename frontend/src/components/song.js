import React, {Component} from 'react';
import SongPopUp from './PopUpMenu/songPopUp';
import MyContext from "../context/authContext";
import libraryService from '../services/libraryService';
import ItemDisplay from './itemDisplay';
import ItemWithFeatures from './HOC/item';

class Song extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    // Menu options
    this.addToLikedPlaylistClick = this.addToLikedPlaylistClick.bind(this);
    this.removeFromLikedPlaylistClick = this.removeFromLikedPlaylistClick.bind(this);

    this.openPopUp = this.openPopUp.bind(this);
  }

  addToLikedPlaylistClick() {
    this.props.handleClose();
    libraryService.addToLikedPlaylist(this.props.data._id)
      .then(data => {
        if (data.songAddedToLibrary) {
          let libraryData = {...this.context.libraryData};
          libraryData.library.songs.push(this.props.data._id);
          this.context.setLibrary(libraryData);
        }
        let likedPlaylistData = {...this.context.likedPlaylist};
        likedPlaylistData.songs.push(this.props.data._id);
        this.context.setLikedPlaylist(likedPlaylistData);
      })
    // Change liked playlist context

    // For some reasaon updating the liked playlist context updates the playlists array too

    // Change playlists context
    // let contextPlaylists = [...this.context.playlists];
    // const likedPlaylistIndex = playlistFuncs.getPlaylistIndex(this.context.likedPlaylist._id, contextPlaylists);
    // contextPlaylists[likedPlaylistIndex].songs.push(this.props.song._id);
    // console.log(contextPlaylists)
    // this.context.setPlaylist(contextPlaylists);
  }

  removeFromLikedPlaylistClick() {
    this.props.handleClose();
    libraryService.removeFromPlaylist(this.props.data._id, this.context.likedPlaylist._id)
      .then(data => {
        // Change liked playlist context
        let likedPlaylistData = {...this.context.likedPlaylist};
        const removedSongIndex = likedPlaylistData.songs.indexOf(this.props.data._id);
        likedPlaylistData.songs.splice(removedSongIndex, 1);
        this.context.setLikedPlaylist(likedPlaylistData);
      })

    // Change playlists context
    // let contextPlaylists = [...this.context.playlists];
    // const likedPlaylistIndex = playlistFuncs.getPlaylistIndex(this.context.likedPlaylist._id, contextPlaylists);
    // const playlistsContextSongIdx = contextPlaylists[likedPlaylistIndex].songs.indexOf(this.props.song._id);
    // contextPlaylists[likedPlaylistIndex].songs.splice(playlistsContextSongIdx, 1);
    // this.context.setPlaylist(contextPlaylists);
  }

  openPopUp() {
    this.props.handleClick();
  }

  render() {
    return (
      <div className="col-3 song-list-wrapper">
        <ItemDisplay 
          item={this.props.data}
          artist={this.props.data.artist}
          artistId={this.props.data.artist._id}
          artistName={this.props.data.artist.name}
          itemTitle={this.props.data.title}
          handleClick={this.props.handleClick}
          imgStyle="song-list-img-wrapper"
          page={this.props.page}
          typeItem="Song"
          songImageClick={this.props.songImageClick}
        />
        <SongPopUp
          {...this.props}
          addToLikedPlaylistClick={this.addToLikedPlaylistClick}
          removeFromLikedPlaylistClick={this.removeFromLikedPlaylistClick}
          songId={this.props.data._id}
          popUpPage={this.props.popUpPage}
          song={this.props.data}
          handleOpenCreatePlaylistModal={this.props.handleOpenCreatePlaylistModal}
        />
      </div>
    )
  }
}

const EnhancedSong = ItemWithFeatures(Song);

export default EnhancedSong;