import React from 'react';
import { Link } from 'react-router-dom';


const ItemDisplay = (props) => {

  const itemImage = () => {
    if (props.typeItem === "Song") {
      return (
        <img className="img-fluid" src={props.item.image} alt={props.item.title} onClick={() => {props.songImageClick(props.item)}} />
      )
    } else {
      return (
        <Link to={`/${props.typeItem.toLowerCase()}/${props.item._id}`}>
          <img className="img-fluid" src={props.item.image} alt={props.item.name} />
        </Link>
      )
    }
  }

  const itemArtistLink = () => {
    if (props.artist && props.page !== "artistPage") {
      return (
        <Link to={"/artist/" + props.artistId}><span className="song-title-artist">{props.artistName}</span></Link>
      )
    }
  }

  const itemTotalSongs = () => {
    if (props.item.typeItem === "Playlist") {
      const songPlural = props.item.songs.length > 1 ? "songs" : "song";
      return (
        <span className="song-title-artist"> &#183; {props.item.songs.length} {songPlural}</span>
      )

    }
  }

  const releaseYear = () => {
    if (props.page === "artistPage") {
      return (
        <span className="song-title-artist">{props.item.releaseYear}</span>
      )
    }
  }

  const itemInfo = () => {
    if (props.typeItem !== "Artist") {
      return (
        <h4 className="song-list-type">
          {props.item.typeItem} 
          <span className="dot-seperator">&#183;</span>
          {itemArtistLink()}
          {itemTotalSongs()}
          {releaseYear()}
        </h4>
      )
    }
  }

  const showPopUp = () => {
    if (props.typeItem !== "Artist" ) {
      return (
        <div className="options-icon-wrapper">
          <i className="fas fa-ellipsis-h options-icon" onClick={props.handleClick}></i>
        </div>
      )
    }
  }

  return(
    <React.Fragment>
      <div className={props.imgStyle}>
        {itemImage()}
      </div>
      <div className="song-list-info-wrapper">
        <h4 className="song-list-title">{props.itemTitle} </h4>
        {itemInfo()}
      </div>
      {showPopUp()}
    </React.Fragment>
  )
}

export default ItemDisplay