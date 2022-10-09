import React, {useState, useContext, Component} from "react";
import AuthService from '../services/authService';
import MyContext from "../context/authContext";
import libraryService from "../services/libraryService";
import axios from 'axios';

class Login extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      user: {username: "", password: ""},
    }
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.logUserIn = this.logUserIn.bind(this);
  }

  onChange(e) {
    this.setState({
      user: {...this.state.user, [e.target.name] : e.target.value}
    });
  }

  async logUserIn(userInfo) {
    const userData = await AuthService.login(userInfo);
    const {isAuthenticated, user, message, userId} = userData;
    if (userData.isAuthenticated) {
      const libraryData = await libraryService.getLibrary();
      const libraryDataPopulated = await libraryService.getLibraryPopulated();
      const yourLikedPlaylistData = await libraryService.getUsersLikedPlaylist();
      this.context.setLibrary(libraryData);
      this.context.setLikedPlaylist(yourLikedPlaylistData);
      this.context.setPlaylist(libraryDataPopulated.library.playlists);
      this.context.setUser(user);
      this.context.setUserId(userId);
      this.context.setIsAuthenticated(isAuthenticated);
      this.props.history.push('/');
    }
  }

  onSubmit(e) {
    e.preventDefault();
    this.logUserIn(this.state.user);
  }

  render() {
    return (
      <div className="container">
        <form onSubmit={this.onSubmit}>
          <h3>Please sign in</h3>
          <label htmlFor="username" className="sr-only">Username: </label>
          <input type="text" name="username" onChange={this.onChange} 
                className="form-control" placeholder="Enter Username"/>
          <label htmlFor="password" className="sr-only">Password: </label>
          <input type="password" name="password" onChange={this.onChange} 
                className="form-control" placeholder="Enter Password"/>
          <button className="btn btn-lg btn-primary btn-block" type="submit">Log in</button> 
        </form> 
      </div>
    )
  }

}

export default Login;