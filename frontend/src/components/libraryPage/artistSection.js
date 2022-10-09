import React, { Component } from 'react';
import MyContext from "../../context/authContext";





const LibraryArtistDisplay = (props) => {

  const songsAmount = () => {
    const songPlural = props.songs.length > 1 ? "songs" : "song";
    return (
      <h5 className="white-txt">{props.songs.length} {songPlural}</h5>
    )
  }


  return (
    <div className="row">
      <div className="col-4">
        <div className="artist-list-img-wrapper ">
          <img className="img-fluid" src={props.artist.image} alt={props.artist.name} />
        </div>
      </div>
      <div className="col-4">
        <h5 className="white-txt">{props.artist.name}</h5>
        {songsAmount()}
      </div>
    </div>
  )
}


export default class LibraryArtistSection extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      artistsSongs: []
    }
  }

  componentDidMount() {
    let artistSongs = [];
    console.log(this.props.artists)
    console.log(this.props.songs)
    for (let i=0; i < this.props.artists.length; i++) {
      let songsWithArtist = [];
      for (let n=0; n < this.props.songs.length; n++) {
        if (this.props.artists[i].songs.includes(this.props.songs[n]._id)) {
          songsWithArtist.push(this.props.songs[n]);
        }
      }
      artistSongs.push({artist: this.props.artists[i], songs: songsWithArtist});
    }
    this.setState({
      artistsSongs: artistSongs,
    });
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

  libraryArtistList() {
    return this.state.artistsSongs.map(albumData=> {
      return <LibraryArtistDisplay 
                key={albumData.artist._id}
                artist={albumData.artist} songs={albumData.songs}
                shufflePlay={this.shufflePlay}
              />
    })
  }
  render() {
    return (
      <div className="playlist-container">
        {this.libraryArtistList()}
      </div>
    )
  }

}