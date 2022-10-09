import React, { Component, useRef } from 'react';

import {AlbumDisplay} from './artistPage';
import PlaylistPopUp from './PopUpMenu/playlistPopUp';

import MyContext from "../context/authContext";
import libraryService from '../services/libraryService';
import playlistFuncs from '../utils/playlistFunc';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import getSongDataService from '../services/getData';
import ItemDisplay from './itemDisplay';
import EnhancedSong from './song';
import EnhancedPlaylist from './playlist';
import EnhancedAlbum from './album';
import { Link } from 'react-router-dom';

const ArtistDisplay = (props) => {
  return (
    <div className="col-3">
      <ItemDisplay
        item={props.artist}
        artist={props.artist}
        artistId={props.artist._id}
        artistName={props.artist.name}
        itemTitle={props.artist.name}
        imgStyle="artist-list-img-wrapper"
        page="homePage"
        typeItem="Artist"
      />
    </div>
  )
}

class HomePage extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);

    this.state = {
      songs: [], 
      playlists: [],
      albums: [],
      artists: [],
      isLoaded: false,
      showCreatePlaylistModal: false,
      newPlaylist: {name: "", public: false, songsAmount: "0", totalDuration: "0", songs: []},
      addToPlaylistSnackBarOpen: false,
    };
    this.getHomePageData = this.getHomePageData.bind(this);
    this.songImageClick = this.songImageClick.bind(this);
    this.playlistImageClick = this.playlistImageClick.bind(this);
    this.addToQueue = this.addToQueue.bind(this);
    this.playNext = this.playNext.bind(this);
    this.getPlaylistSongData = this.getPlaylistSongData.bind(this);
    this.shufflePlay = this.shufflePlay.bind(this);
    this.deletePlaylist = this.deletePlaylist.bind(this);
    this.updatePlaylist = this.updatePlaylist.bind(this);

    this.songList = this.songList.bind(this);
    this.playlistList = this.playlistList.bind(this);
    this.albumList = this.albumList.bind(this);
    this.artistList = this.artistList.bind(this);

    // Create new playlist modal
    this.handleOpenCreatePlaylistModal = this.handleOpenCreatePlaylistModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.onChangeNewPlaylistName = this.onChangeNewPlaylistName.bind(this);
    this.onChangeNewPlaylistPrivacy = this.onChangeNewPlaylistPrivacy.bind(this);
    this.onSubmitNewPlaylistForm = this.onSubmitNewPlaylistForm.bind(this);
    this.resetForm = this.resetForm.bind(this);

    // Features for seperate items
    this.removePlaylistFromLibrary = this.removePlaylistFromLibrary.bind(this);
    this.addPlaylistToLibrary = this.addPlaylistToLibrary.bind(this);
    this.addSongToLibrary = this.addSongToLibrary.bind(this);
    this.removeSongFromLibrary = this.removeSongFromLibrary.bind(this);
    this.addAlbumToLibrary = this.addAlbumToLibrary.bind(this);
    this.removeAlbumFromLibrary = this.removeAlbumFromLibrary.bind(this);
    this.addToPlaylist = this.addToPlaylist.bind(this);
    this.addSongToPlaylist = this.addSongToPlaylist.bind(this);
  }

  componentDidMount() {
    this.getHomePageData()
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


  async getHomePageData() {
    const songsData = await getSongDataService.getAllSongs();
    const playlistsData = await getSongDataService.getAllPublicPlaylists();
    const albumsData = await getSongDataService.getAllAlbums();
    const artistsData = await getSongDataService.gettAllArtists();
    this.setState({
      songs: songsData,
      playlists: playlistsData,
      albums: albumsData,
      artists: artistsData,
      isLoaded: true,
    });
  }

  songList() {
    return this.state.songs.map(currentSong => {
      return <EnhancedSong 
                data={currentSong} 
                key={currentSong._id} 
                songImageClick={this.songImageClick} 
                addToQueue={this.addToQueue} 
                playNext={this.playNext}
                removeFromLibrary={this.removeSongFromLibrary}
                addToLibrary={this.addSongToLibrary}
                addToPlaylist={this.addSongToPlaylist}
                page="homePage"
                popUpPage="homePage" 
                handleOpenCreatePlaylistModal={this.handleOpenCreatePlaylistModal}
              />;
    })
  }

  playlistList() {
    return this.state.playlists.map(currentPlaylist => {
      let owner = currentPlaylist.owner ? currentPlaylist.owner._id : null;
      return <EnhancedPlaylist 
                data={currentPlaylist} 
                key={currentPlaylist._id} 
                playlistOwner={owner}
                playlistImageClick={this.playlistImageClick} 
                addToQueue={this.addToQueue} 
                playNext={this.playNext} 
                shufflePlay={this.shufflePlay}
                removeFromLibrary={this.removePlaylistFromLibrary}
                addToLibrary={this.addPlaylistToLibrary}
                addToPlaylist={this.addToPlaylist}
                deletePlaylist={this.deletePlaylist}
                page="homePage"
                popUpPage="homePage"
                imgStyle="playlist-img-wrapper"
                handleOpenCreatePlaylistModal={this.handleOpenCreatePlaylistModal}
              />;
    })
  }

  albumList() {
    return this.state.albums.map(currentAlbum => {
      return <EnhancedAlbum
              data={currentAlbum} 
              key={currentAlbum._id} 
              shufflePlay={this.shufflePlay}
              addToQueue={this.addToQueue}
              playNext={this.playNext}
              removeFromLibrary={this.removeAlbumFromLibrary}
              addToLibrary={this.addAlbumToLibrary}
              addToPlaylist={this.addToPlaylist}
              popUpPage="homePage"
              page="homePage"
              handleOpenCreatePlaylistModal={this.handleOpenCreatePlaylistModal}
            />
    })
  }

  artistList() {
    return this.state.artists.map(currentArtist => {
      return <ArtistDisplay artist={currentArtist} key={currentArtist._id} />
    })
  }

  songImageClick(songObj) {
    this.props.playSingleSong(songObj);
    console.log("slide player")
  }

  async getPlaylistSongData(playlistObj) {
    const playlistData = await getSongDataService.getPlaylistData(playlistObj._id);
    return playlistData.songs;
  }

  playlistImageClick(playlistObj) {
    this.getPlaylistSongData(playlistObj)
      .then(data => {
        this.props.playSinglePlaylist(data);
      })
      .catch(error => {
        console.log(error);
      })
  }

  addToQueue(songObj) {
    if (songObj.typeItem === "Playlist") {
      this.getPlaylistSongData(songObj)
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
    if (songObj.typeItem === "Playlist") {
      this.getPlaylistSongData(songObj)
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
    this.getPlaylistSongData(playlistObj)
      .then(data => {
        this.props.shufflePlayCollection(data);
      })
      .catch(error => {
        console.log(error);
      })
  }

  updatePlaylist(playlistId, updatedPlaylistData) {
    // Change the state of the playlist name and public
    // If public is false then splice it out of the state
    // NOTE: Alter context as well
    libraryService.updatePlaylist(playlistId, updatedPlaylistData);
    const playlistObjIndex = playlistFuncs.getPlaylistIndex(playlistId, this.state.playlists);
    if (!updatedPlaylistData.public) {
      let Newplaylists = [...this.state.playlists]
      Newplaylists.splice(playlistObjIndex, 1);
      this.setState({
        playlists: Newplaylists,
      });
    } else {
      let Newplaylists = [...this.state.playlists]
      Newplaylists[playlistObjIndex].name = updatedPlaylistData.name;
      this.setState({
        playlists: Newplaylists,
      });
    }
  }

  deletePlaylist(playlistId) {
    libraryService.deletePlaylist(playlistId)
      .then(data => {
        // Remove the playlist from the state
        const playlistObjIndex = playlistFuncs.getPlaylistIndex(playlistId, this.state.playlists);
        let Newplaylists = [...this.state.playlists]
        Newplaylists.splice(playlistObjIndex, 1);
        this.setState({
          playlists: Newplaylists,
        });
        // Change the context playlists state and library data
        const playlistContextIndex = playlistFuncs.getPlaylistIndex(playlistId, this.context.playlists);
        let newContextPlaylists = [...this.context.playlists];
        newContextPlaylists.splice(playlistContextIndex, 1);
        this.context.setPlaylist(newContextPlaylists);

        // Change library data context
        const playlistLibraryDataIndex = this.context.libraryData.library.playlists.indexOf(playlistId);
        let newLibraryData = {...this.context.libraryData};
        newLibraryData.library.playlists.splice(playlistLibraryDataIndex);
        this.context.setLibrary(newLibraryData);
      })
  }

  removePlaylistFromLibrary(playlist) {
    libraryService.removePlaylistFromLibrary(playlist._id)
      .then(data => {
        // Updtate the playlists context
        let playlists = [...this.context.playlists];
        const removedPlaylistIndex = playlistFuncs.getPlaylistIndex(playlist._id, playlists);
        playlists.splice(removedPlaylistIndex, 1);
        this.context.setPlaylist(playlists)
        // Update the libraryData context
        let newLibraryData = {...this.context.libraryData}
        let newLibraryDataPlaylists = newLibraryData.library.playlists;
        const removeLibraryDataPlaylist = newLibraryDataPlaylists.indexOf(playlist._id);
        newLibraryData.library.playlists.splice(removeLibraryDataPlaylist, 1);
        this.context.setLibrary(newLibraryData);
      })
  }

  addPlaylistToLibrary(playlist) {
    libraryService.addPlaylistToLibrary(playlist._id)
      .then(data => {
        // Updtate the playlists context
        let playlists = [...this.context.playlists];
        playlists.push(playlist);
        this.context.setPlaylist(playlists);
        // Update the library data
        let newLibraryData = {...this.context.libraryData}
        let newLibraryDataPlaylists = newLibraryData.library.playlists;
        newLibraryDataPlaylists.push(playlist._id);
        newLibraryData.library.playlists = newLibraryDataPlaylists;
        this.context.setLibrary(newLibraryData);
      })
  }

  addSongToLibrary(song) {
    libraryService.addSongToLibrary(song._id)
      .then(data => {
        let libraryData = {...this.context.libraryData};
        libraryData.library.songs.push(song._id);
        this.context.setLibrary(libraryData);
      })
  }

  removeSongFromLibrary(song) {
    libraryService.removeSongFromLibrary(song._id)
      .then(data => {
        let libraryData = {...this.context.libraryData};
        const removedSongIndex = libraryData.library.songs.indexOf(song._id);
        libraryData.library.songs.splice(removedSongIndex, 1);
        this.context.setLibrary(libraryData);
      })
  }

  addAlbumToLibrary(album) {
    libraryService.addAlbumToLibrary(album._id)
      .then(data => {
        // Update the library data context
        let newLibraryData = {...this.context.libraryData}
        let newLibraryDataAlbums = newLibraryData.library.albums;
        newLibraryDataAlbums.push(album._id);
        newLibraryData.library.albums = newLibraryDataAlbums;

        // Update the songs 
        newLibraryData.library.songs = data.updatedSongs;
        this.context.setLibrary(newLibraryData);
      })
  }

  removeAlbumFromLibrary(album) {
    libraryService.removeAlbumFromLibrary(album._id)
      .then(data => {
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
      })

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


  render() {
    if (!this.state.isLoaded) {
      return <h1 className="white-txt">loading</h1>
    } else {
      return (
        <div className="container-fluid px-0 music-list-page">
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
          <h1 className="title-music-list">Main Music Page</h1>
          <h3 className="title-music-list">Songs</h3>
          <div className="row songs-list-container">
            {this.songList()}
          </div>
          <h3 className="title-music-list">Playlists</h3>
          <div className="row playlist-container">
            {this.playlistList()}
          </div>
          <h3 className="title-music-list">Albums</h3>
          <div className="row playlist-container">
            {this.albumList()}
          </div>
          <h3 className="title-music-list">Artists</h3>
          <div className="row playlist-container">
            {this.artistList()}
          </div>
          <Link to="/search/shock"><p>Shock</p></Link>
        </div>
      )
    }
  }
}

export default HomePage;