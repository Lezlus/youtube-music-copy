import React, { Component } from 'react';
import libraryService from '../../services/libraryService';
import MyContext from "../../context/authContext";
import EnhancedSongRow from '../SongRow';
import playlistFuncs from '../../utils/playlistFunc';

class LibrarySongsSection extends Component {
    static contextType = MyContext;
    constructor(props) {
      super(props);
      this.shufflePlay = this.shufflePlay.bind(this);
      this.addToQueue = this.addToQueue.bind(this);
      this.playNext = this.playNext.bind(this);
      this.playPlaylistSong = this.playPlaylistSong.bind(this);
      this.removeSongFromLibrary = this.removeSongFromLibrary.bind(this);
      this.addSongToPlaylist = this.addSongToPlaylist.bind(this);
      this.addToLikedSongs = this.addToLikedSongs.bind(this);
      this.removeFromLikedSongs = this.removeFromLikedSongs.bind(this);
    }
  
    shufflePlay() {
      this.props.shufflePlayCollection(this.props.songs);
    }
  
    addToQueue(songObj) {
      if (songObj.typeItem === "Playlist") {
        this.props.addToQueueNewQueueSong(this.props.songs);
      } else {
        this.props.addToQueueNewQueueSong(songObj);
      }
    }
  
    playNext(songObj) {
      if (songObj.typeItem === "Playlist") {
        this.props.playNextQueueSong(this.props.songs);
      } else {
        this.props.playNextQueueSong(songObj);
      }
    }

    removeSongFromLibrary(song) {
      libraryService.removeSongFromLibrary(song._id)
        .then(data => {
          this.props.getSongLibraryData();
          // Update the artists data
          if (!data.artistInSong) {
            this.props.getArtistLibraryData();
          }
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
          this.props.getPlaylistLibraryData();
        })

    }
  
    playPlaylistSong(pos) {
      this.props.playSinglePlaylist(this.props.songs, pos)
    }

    addToLikedSongs(songId) {
      libraryService.addToLikedPlaylist(songId)
        .then(data =>{
          let likedPlaylistData = {...this.context.likedPlaylist};
          likedPlaylistData.songs.push(songId);
          this.context.setLikedPlaylist(likedPlaylistData);
          this.props.getPlaylistLibraryData();
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
          this.props.getPlaylistLibraryData();
        })
    }

    songRow() {
      let i = -1;
      return this.props.songs.map(currentSong => {
        i++
        return <EnhancedSongRow 
                  data={currentSong} 
                  key={currentSong._id} 
                  pos={i} 
                  playPlaylistSong={this.playPlaylistSong} 
                  playNext={this.playNext} 
                  addToQueue={this.addToQueue}   
                  removeFromLibrary={this.removeSongFromLibrary}
                  addToPlaylist={this.addSongToPlaylist}
                  addToLikedSongs={this.addToLikedSongs}
                  removeFromLikedSongs={this.removeFromLikedSongs}
                  page="libraryPage"
                  popUpPage="libraryPage"
                  handleOpenCreatePlaylistModal={this.props.handleOpenCreatePlaylistModal}
                />
      })
    }
  
    render() {
      return (
        <div className="container main-container">
          <div className="row playlist-song-row">
            <div className="col-3">
              <h4 className="white-txt playlist-song-row-txt" onClick={() => {this.shufflePlay()}}>Shuffle all</h4>
            </div>
          </div>
          {this.songRow()}
        </div>
      )
    }
}

export default LibrarySongsSection