import React, {useState, useContext, Component} from "react";
import { Link } from 'react-router-dom';
import AuthService from '../services/authService';
import MyContext from "../context/authContext";
import SearchContainer from "./searchBar";

export default class Navbar extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.onClickLogoutHandler = this.onClickLogoutHandler.bind(this);
  }

  onClickLogoutHandler() {
    AuthService.logout()
      .then(data => {
        if (data.success) {
          this.context.setUser(data.user);
          this.context.setIsAuthenticated(false);
          this.context.setLibrary({library: {songs: []}});
          this.context.setPlaylist([]);
          this.context.setLikedPlaylist({songs: []})
          this.context.setUserId("");
        }
      })
      .catch(err => {
        console.log(err);
      })
  }

  unauthenticatedNavBar() {
    return (
      <>
        <li className="nav-item active">
          <Link to="/" className="nav-link navbar-link-custom">Home</Link>
        </li>
        <li className="nav-item">
          <Link to="/explore" className="nav-link navbar-link-custom">Explore</Link>
        </li>
        <li className="nav-item">
          <Link to="/login" className="nav-link navbar-link-custom">Login</Link>
        </li>
        <li className="nav-item">
          <Link to="/register" className="nav-link navbar-link-custom">Register</Link>
        </li>
      </>
    )
  }

  authenticatedNavBar() {
    return (
      <>
        <li className="nav-item active">
          <Link to="/" className="nav-link navbar-link-custom">Home</Link>
        </li>
        <li className="nav-item">
          <Link to="/explore" className="nav-link navbar-link-custom">Explore</Link>
        </li>
        <li className="nav-item">
          <Link to="/library" className="nav-link navbar-link-custom">Library</Link>
        </li>
        <li className="nav-item">
          <button type="button" className="btn btn-link nav-link" onClick={this.onClickLogoutHandler}>Logout</button>
        </li>
      </>
    )
  }


  render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-custom">
        <div className="navbar-brand-wrapper">
          <Link to="/" className="navbar-brand mr-auto">Music Player</Link>
        </div>
        <form className="form-inline search-container">
          <SearchContainer />
        </form>
        <div className="navbar-collapse collapse dual-collapse2">
          <ul className="navbar-nav ml-auto navbar-link-container">
              {!this.context.isAuthenticated ? this.unauthenticatedNavBar() : this.authenticatedNavBar()}
          </ul>
        </div>
      </nav>
    )
  }
}