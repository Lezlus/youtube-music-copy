import React, { Component } from 'react';
import libraryService from '../../services/libraryService';
import MyContext from "../../context/authContext";
import LibrarySongsSection from './songSection';
import LibraryPlaylistSection from './playlistSection';
import LibraryAlbumSection from './albumSection';
import LibraryArtistSection from './artistSection';
import Modal from '@material-ui/core/Modal';


import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
  Redirect,
  useRouteMatch
} from "react-router-dom";

export default class Library extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      library: {},
      playlists: [],
      albums: [],
      songs: [],
      artists: [],
      showCreatePlaylistModal: false,
      newPlaylist: {name: "", public: false, songsAmount: "0", totalDuration: "0", songs: []}
    }
    this.getLibraryData = this.getLibraryData.bind(this);
    this.getPlaylistLibraryData = this.getPlaylistLibraryData.bind(this);
    this.getSongLibraryData = this.getSongLibraryData.bind(this);
    this.getAlbumLibraryData = this.getAlbumLibraryData.bind(this);
    this.getArtistLibraryData = this.getArtistLibraryData.bind(this);

    // Create new playlist modal
    this.handleOpenCreatePlaylistModal = this.handleOpenCreatePlaylistModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.onChangeNewPlaylistName = this.onChangeNewPlaylistName.bind(this);
    this.onChangeNewPlaylistPrivacy = this.onChangeNewPlaylistPrivacy.bind(this);
    this.onSubmitNewPlaylistForm = this.onSubmitNewPlaylistForm.bind(this);
    this.resetForm = this.resetForm.bind(this);
  }

  componentDidMount() {
    this.setState({
      library: this.context.libraryData.library,
    });
    this.getLibraryData();
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
        if (!data.message.msgError) {
          this.getPlaylistLibraryData();
        } else {
          this.context.setUser("");
          this.context.setIsAuthenticated(false);
          this.context.setLibrary({});
        }
      })
  }

  resetForm() {
    this.setState({newPlaylist: {name: "", public: false, songsAmount: "0", totalDuration: "0", songs: []}})
  }

  async getLibraryData() {
    const libraryDataPopulated = await libraryService.getLibraryPopulated();
    this.setState({
      playlists: libraryDataPopulated.library.playlists,
      songs: libraryDataPopulated.library.songs,
      albums: libraryDataPopulated.library.albums,
      artists: libraryDataPopulated.library.artists,
    })
  }

  async getPlaylistLibraryData() {
    const libraryDataPopulated = await libraryService.getLibraryPopulated();
    this.setState({
      playlists: libraryDataPopulated.library.playlists
    });
  }

  async getSongLibraryData() {
    const libraryDataPopulated = await libraryService.getLibraryPopulated();
    this.setState({ 
      songs: libraryDataPopulated.library.songs
    });
  }

  async getAlbumLibraryData() {
    const libraryDataPopulated = await libraryService.getLibraryPopulated();
    this.setState({ 
      albums: libraryDataPopulated.library.albums
    });
  }

  async getArtistLibraryData() {
    const libraryDataPopulated = await libraryService.getLibraryPopulated();
    this.setState({ 
      artists: libraryDataPopulated.library.artists
    });
  }

  render() {
    return(
      <div className="container">
        <h1 className="white-txt">Library Page</h1>
        <div className="row">
          <div className="col-2">
            <h5><Link to={`/library/playlist`}>Playlists</Link></h5>
          </div>
          <div className="col-2">
            <h5><Link to={`/library/albums`}>Albums</Link></h5>
          </div>
          <div className="col-2">
            <h5><Link to={`/library/songs`}>Songs</Link></h5>
          </div>
          <div className="col-2">
            <h5><Link to={`/library/artists`}>Artists</Link></h5>
          </div>
        </div>
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
        <Switch>
          <Route exact path="/library">
            <Redirect to="/library/playlist" />
          </Route>
          <Route path="/library/playlist">
            <LibraryPlaylistSection 
              playlists={this.state.playlists} playSinglePlaylist={this.props.playSinglePlaylist} 
              addToQueueNewQueueSong={ this.props.addToQueueNewQueueSong} playNextQueueSong={this.props.playNextQueueSong}
              shufflePlayCollection={this.props.shufflePlayCollection} getPlaylistLibraryData={this.getPlaylistLibraryData}
              handleOpenCreatePlaylistModal={this.handleOpenCreatePlaylistModal}
            />
          </Route>
          <Route path="/library/albums">
            <LibraryAlbumSection
              albums={this.state.albums} shufflePlayCollection={this.props.shufflePlayCollection}
              addToQueueNewQueueSong={ this.props.addToQueueNewQueueSong} playNextQueueSong={this.props.playNextQueueSong}
              getAlbumLibraryData={this.getAlbumLibraryData} getArtistLibraryData={this.getArtistLibraryData}
              getPlaylistLibraryData={this.getPlaylistLibraryData}
              getSongLibraryData={this.getSongLibraryData} handleOpenCreatePlaylistModal={this.handleOpenCreatePlaylistModal}
            />
          </Route>
          <Route path="/library/songs">
            <LibrarySongsSection 
              songs={this.state.songs} shufflePlayCollection={this.props.shufflePlayCollection} 
              playSinglePlaylist={this.props.playSinglePlaylist} addToQueueNewQueueSong={ this.props.addToQueueNewQueueSong} 
              playNextQueueSong={this.props.playNextQueueSong} getSongLibraryData={this.getSongLibraryData} 
              getArtistLibraryData={this.getArtistLibraryData} getPlaylistLibraryData={this.getPlaylistLibraryData}
              handleOpenCreatePlaylistModal={this.handleOpenCreatePlaylistModal}
            />
          </Route>
          <Route path="/library/artists">
            <LibraryArtistSection
              songs={this.state.songs} artists={this.state.artists}
              shufflePlayCollection={this.props.shufflePlayCollection}
            />
          </Route>
        </Switch>
      </div>
    )
  }
}