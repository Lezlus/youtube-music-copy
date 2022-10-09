import React, { Component } from 'react';
import MyContext from "../../context/authContext";
import { AlbumDisplay } from '../artistPage'; 
import EnhancedAlbum from '../album';
import libraryService from '../../services/libraryService';
import playlistFuncs from '../../utils/playlistFunc';


export default class LibraryAlbumSection extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);

    this.addToQueue = this.addToQueue.bind(this);
    this.playNext = this.playNext.bind(this);
    this.shufflePlay = this.shufflePlay.bind(this);
    this.libraryAlbumList = this.libraryAlbumList.bind(this);
    this.removeAlbumFromLibrary = this.removeAlbumFromLibrary.bind(this);
    this.addToPlaylist = this.addToPlaylist.bind(this);
  }

  addToQueue(songObj) {
    if (songObj.typeItem === "Album") {
      this.getAlbumData(songObj)
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
    if (songObj.typeItem === "Album") {
      this.getAlbumData(songObj)
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

  removeAlbumFromLibrary(album) {
    libraryService.removeAlbumFromLibrary(album._id)
      .then(data => {
        if(!data.artistInSong) {
          this.props.getArtistLibraryData();
        }
        this.props.getAlbumLibraryData();
        this.props.getSongLibraryData();

        let newLibraryData = {...this.context.libraryData}
        newLibraryData.library.songs = data.updatedSongs;
        // Update the library data context
        let newLibraryDataAlbums = newLibraryData.library.albums;
        const albumToRemoveIndex = newLibraryDataAlbums.indexOf(album._id);
        newLibraryDataAlbums.splice(albumToRemoveIndex, 1);
        newLibraryData.library.albums = newLibraryDataAlbums;

        this.context.setLibrary(newLibraryData);
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

  libraryAlbumList() {
    return this.props.albums.map(album => {
      return <EnhancedAlbum
              data={album} 
              key={album._id}
              shufflePlay={this.shufflePlay}
              addToQueue={this.addToQueue}
              playNext={this.playNext}
              popUpPage="libraryPage"
              page="libraryPage"
              removeFromLibrary={this.removeAlbumFromLibrary}
              addToPlaylist={this.addToPlaylist}
              handleOpenCreatePlaylistModal={this.props.handleOpenCreatePlaylistModal}
            />
    })
  }

  render() {
    return (
      <div className="row playlist-container">
        {this.libraryAlbumList()}
      </div>
    )
  }
}