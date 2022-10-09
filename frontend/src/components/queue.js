import React, { Component } from 'react';

const CurrentSongQueueImg = props => (
  <div className="col-7 player-img-container">
    <div className="player-img-wrapper">
      <img className="img-fluid" src={props.mainPlayerImg} alt="Main Img" id="mainImg"/>
    </div>
  </div>
)

const SongQueueDisplay = props => (
  <div className={`col-12 ${props.queueBarHighlight}`}>
    <div className="row queue-song-wrapper">
      <div className="col-2 queue-img-wrapper">
        <img src={props.song.image} className="queue-img" data-queue-pos={props.pos} onClick={() => {props.queueSongImgClick(props.pos)}}/>
      </div>
      <div className="col-8 queue-title-wrapper">
        <h5 className="song-title">{props.song.title}</h5>
        <h5 className="song-artist">{props.song.artist.name}</h5>
      </div>
      <div className="col-2 queue-duration-wrapper">
        <h5 className="song-duration">{props.song.duration}</h5>
      </div>
      <h6 className="removeFromQueue" data-queue-pos={props.pos} onClick={() => {props.removeFromQueue(props.pos)}}>Remove From Queue</h6>
    </div>
    <hr className="queue-song-divider"/>
  </div>
)

export {CurrentSongQueueImg, SongQueueDisplay}