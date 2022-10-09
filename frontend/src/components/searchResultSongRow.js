import SongPopUp from './PopUpMenu/songPopUp';
import ItemWithFeatures from './HOC/item';
import React from 'react';

const SearchResultSongRow = (props) => {
  const songClick = () => {
    props.songImageClick(props.data);
  }

  const albumName = () => {
    if (props.data.album) {
      return (
        <React.Fragment>
          <span className="dot-seperator">&#183;</span>
          {props.data.album.name}
        </React.Fragment>
      )
    }
  }

  return (
    <div className="row playlist-song-row">
      <div className="col-3">
        <div className="playlist-song-row-img-wrapper">
          <img className="img-fluid playlist-song-row-img" src={props.data.image} alt={props.data.title} onClick={() => {songClick()}}/>
        </div>
      </div>
      <div className="col-4">
        <h6 className="white-txt playlist-song-row-txt">{props.data.title}</h6>
        <h6 className="white-txt">
          {props.data.typeItem}
          <span className="dot-seperator">&#183;</span>
          {props.data.artist.name}
          {albumName()}
          <span className="dot-seperator">&#183;</span>
          {props.data.duration}
        </h6>
      </div>
      <div className="col-2">
        <i className="fas fa-ellipsis-v playlist-song-options" onClick={props.handleClick}></i>
      </div>
      <SongPopUp 
        {...props}
        songId={props.data._id} 
        popUpPage={props.popUpPage}
        song={props.data}
        handleOpenCreatePlaylistModal={props.handleOpenCreatePlaylistModal}
      />
    </div>
  )
}

const EnhancedSearchhResultSongRow = ItemWithFeatures(SearchResultSongRow)
export default EnhancedSearchhResultSongRow;