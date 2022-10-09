import MyContext from "../context/authContext";
import React, { Component } from 'react';
import AuthService from '../services/authService';
import libraryService from "../services/libraryService";
import axios from 'axios';

class MyProvider extends Component {
  state = {
    user: null,
    isAuthenticated: false,
    libraryData: {library: {songs: []}},
    playlists: [],
    userId: "",
    likedPlaylist: {songs: []},
  };

  // Create a async method to retrieve all context
  componentDidMount() {
    this.getContextData();
  }

  async getContextData() {
    const autheticatedData = await AuthService.isAuthenticated();
    if (autheticatedData.isAuthenticated) {
      const libraryData = await libraryService.getLibrary();
      const libraryDataPopulated = await libraryService.getLibraryPopulated();
      const yourLikedPlaylistData = await libraryService.getUsersLikedPlaylist();
      this.setState({
        user: autheticatedData.user,
        isAuthenticated: autheticatedData.isAuthenticated,
        userId: autheticatedData.userId,
        libraryData: libraryData,
        playlists: libraryDataPopulated.library.playlists,
        likedPlaylist: yourLikedPlaylistData,
      });
    }
  }

  render() {
    return (
      <MyContext.Provider 
      value={{user: this.state.user, isAuthenticated: this.state.isAuthenticated, 
          libraryData: this.state.libraryData, playlists: this.state.playlists,
          userId: this.state.userId,
          likedPlaylist: this.state.likedPlaylist,
              setUser: userVal => {
                this.setState({
                  user: userVal,
                })
              },
              setIsAuthenticated: authVal => {
                this.setState({
                  isAuthenticated: authVal
                })
              },
              setLibrary: libraryData => {
                this.setState({
                  libraryData: libraryData
                })
              },
              setPlaylist: playlistArray => {
                this.setState({
                  playlists: playlistArray
                })
              },
              setUserId: userId => {
                this.setState({
                  userId: userId,
                })
              },
              setLikedPlaylist: playlist => {
                this.setState({
                  likedPlaylist: playlist
                })
              }
              }}>
        {this.props.children}
      </MyContext.Provider>
    );
  }
} 

export default MyProvider;