
import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
// import { Link } from 'react-router-dom';
import {CurrentSongQueueImg, SongQueueDisplay} from "./components/queue";
import HomePage from "./components/home";
import { gsap } from 'gsap';
import {Player} from './player';
import {createSongObj, shuffleArray} from './utils/playerUtils';
import Controls from './components/controls';
import Navbar from './components/navbar';
import Library from './components/libraryPage/library';
import ArtistPage from './components/artistPage';
import AlbumPage from './components/albumPage';
import Explore from './components/explore';
import $ from 'jquery';
import slider from 'jquery-ui/ui/widgets/slider';
import PlaylistPage from "./components/playlistView";
import Login from './components/login';
import Register from './components/register';
import SearchResultPage from './components/searchResultPage';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.playerBodyElem = null;
    this.playerControlsElem = null;
    this.player = null;
    this.state = {
      playerControlsElem: null,
      playerBodyElem: null,
      firstOpen: false,
      isOpen: false,
      mainPlayerImg: "",
      currentQueue: [],
      currentSong: {title: "", artist: "", duration: "", image: ""},
      currentSongIndex: 0,
      trueSongDuration: "0:00",
      currentTimer: "0:00",
      pauseBtnClass: "pauseBtn-active",
      playBtnClass: "playBtn-inactive",
    }
    this.slidePlayer = this.slidePlayer.bind(this);
    this.slidePlayerBtnClick = this.slidePlayerBtnClick.bind(this);
    this.closeSlidePlayer = this.closeSlidePlayer.bind(this);
    this.addToQueueNewQueueSong = this.addToQueueNewQueueSong.bind(this);
    this.removeFromQueue = this.removeFromQueue.bind(this);
    this.playNextQueueSong = this.playNextQueueSong.bind(this);
    this.queueSongImgClick = this.queueSongImgClick.bind(this);
    this.playSingleSong = this.playSingleSong.bind(this);
    this.playSinglePlaylist = this.playSinglePlaylist.bind(this);
    this.getSongDuration = this.getSongDuration.bind(this);
    this.step = this.step.bind(this);
    this.getSongDuration = this.getSongDuration.bind(this);
    this.scrubTimer = this.scrubTimer.bind(this);
    this.skipSong = this.skipSong.bind(this);
    this.shuffleQueue = this.shuffleQueue.bind(this);
    this.shufflePlayCollection = this.shufflePlayCollection.bind(this);

    this.showPauseBtn = this.showPauseBtn.bind(this);
    this.showPlayBtn = this.showPlayBtn.bind(this);
  }

  componentDidMount() {
    this.setState({
      playerControlsElem: this.playerControlsElem,
      playerBodyElem: this.playerBodyElem,
    })
    this.player = new Player([], this);
  }

  step() {
    if (this.player.playlist.length) {
      let sound = this.player.playlist[this.player.index].howl;
      let seek = sound.seek() || 0;
      if (!this.player.is_sliding) {
        this.setState({
          currentTimer: this.player.formatTime(Math.round(seek))
        })
        $('#timeSlider').slider("value", (seek || 0));
      }
      if (sound.playing()) {
        requestAnimationFrame(this.step);
      }
    }
  }

  scrubTimer(sec) {
    this.setState({
      currentTimer: this.player.formatTime(Math.round(sec)),
    })
  }

  playSingleSong(songObj) {
    this.setState({
      mainPlayerImg: songObj.image,
      currentQueue: [songObj],
      currentSong: songObj,
      playBtnClass: "playBtn-inactive",
      pauseBtnClass: "pauseBtn-active"
    });
    this.player.playSingleSong(songObj);
    this.slidePlayer();
  }

  getSongDuration(val) {
    this.setState({
      trueSongDuration: val
    })
  }

  setTimerValue(val) {
    $('#timeSlider').slider("option", 'max', val);
  }

  showPauseBtn() {
    this.setState({
      playBtnClass: "playBtn-inactive",
      pauseBtnClass: "pauseBtn-active"
    });
  }

  showPlayBtn() {
    this.setState({
      playBtnClass: "playBtn-active",
      pauseBtnClass: "pauseBtn-inactive",
    });
  }

  playSinglePlaylist(playlistSongsArray, index) {
    let pos = typeof index === "number" ? index : this.state.currentSongIndex;
    console.log(pos);
    this.player.playPlaylist(playlistSongsArray, pos);
    this.setState({
      currentQueue: playlistSongsArray,
      currentSong: playlistSongsArray[pos],
      mainPlayerImg: playlistSongsArray[pos].image,
      currentSongIndex: pos,
      playBtnClass: "playBtn-inactive",
      pauseBtnClass: "pauseBtn-active"
      
    })
    this.slidePlayer();
  }

  slidePlayer() {
    let tl = gsap.timeline();
    if (!this.state.firstOpen) {
      tl.to(this.state.playerBodyElem, {duration: .7, top: '0%', ease: 'power1.out'});
      tl.to(this.state.playerControlsElem, {duration: .3, bottom: '0%', ease: 'power1.out'});
      this.setState({firstOpen: true, isOpen: true});
    } else {
      tl.to(this.state.playerBodyElem, {duration: .7, top: '0%', ease: 'power1.out'});
      this.setState({isOpen: true});
    }
  }

  slidePlayerBtnClick() {
    let tl = gsap.timeline();
    if (!this.state.isOpen) {
      tl.to(this.state.playerBodyElem, {duration: .7, top: '0%', ease: 'power1.out'});
      this.setState({isOpen: true});
    } else {
      tl.to(this.state.playerBodyElem, {duration: .7, top: '100%', ease: 'power1.out'});
      this.setState({isOpen: false});
    }
  }

  closeSlidePlayer() {
    let tl = gsap.timeline();
    if (this.state.isOpen) {
      tl.to(this.state.playerBodyElem, {duration: .7, top: '100%', ease: 'power1.out'});
      tl.to(this.state.playerControlsElem, {duration: .3, bottom: '-8%', ease: 'power1.out'});
    } else {
      tl.to(this.state.playerControlsElem, {duration: .3, bottom: '-8%', ease: 'power1.out'});
    }
    this.setState({
      firstOpen: false,
      isOpen: false,
      mainPlayerImg: "",
      currentQueue: [],
      currentSong: {title: "", artist: "", duration: "", image: ""},
      currentSongIndex: 0,
      trueSongDuration: "0:00",
      currentTimer: "0:00",
      pauseBtnClass: "pauseBtn-active",
      playBtnClass: "playBtn-inactive",
    })

  }

  addToQueueNewQueueSong(songObj) {
    let isArray = Array.isArray(songObj);
    if (this.state.currentQueue.length === 0 && !isArray) {
      this.playSingleSong(songObj);
    } else if (this.state.currentQueue.length === 0 && isArray) {
        this.playSinglePlaylist(songObj);
    } else {
        if (isArray) {
          let array = [...this.state.currentQueue];
          array.push(...songObj);
          this.setState({
            currentQueue: array,
          })
        } else {
          this.setState({
            currentQueue: this.state.currentQueue.concat(songObj)
          })
        }
        this.player.addSongToQueue(songObj);
    }
  }

  playNextQueueSong(songObj, currentQueueSongIndex) {
    let isArray = Array.isArray(songObj);
    if (this.state.currentQueue.length === 0 && !isArray) {
      this.playSingleSong(songObj);
    } else if (this.state.currentQueue.length === 0 && isArray) {
        this.playSinglePlaylist(songObj);
    } else {
        if (isArray) {
          let array = [...this.state.currentQueue];
          songObj.map(songItem => {
            let pos = songObj.indexOf(songItem) + 1;
            array.splice(pos + currentQueueSongIndex, 0, songItem);
          })
          this.setState({
            currentQueue: array,
          })
        } else {
          let array = [...this.state.currentQueue];
          array.splice(currentQueueSongIndex + 1, 0, songObj);
          this.setState({
            currentQueue: array,
          })
        }
        this.player.playNext(songObj);
    }
  }

  removeFromQueue(songObjPos) {
    this.player.removeSongFromQueue(songObjPos);
    let array = [...this.state.currentQueue];
    // Edge case when we remove the only song in the queue
    if (array.length === 1) {
      this.closeSlidePlayer();
    }
    // When you want to remove the current song playing
    else if (songObjPos === this.state.currentSongIndex) {
      array.splice(songObjPos, 1);
      // Edge case if the current song is the last obj in the array
      if (songObjPos === array.length) {
        songObjPos = songObjPos - 1;
      }
      let newCurrentSong = array[songObjPos];
      this.setState({
        currentQueue: array,
        currentSong: newCurrentSong,
        mainPlayerImg: newCurrentSong.image,
        currentSongIndex: songObjPos,
        playBtnClass: "playBtn-inactive",
        pauseBtnClass: "pauseBtn-active"
      })
    } else {
      array.splice(songObjPos, 1);
      this.setState({
        currentQueue: array,
      });
    }
  }

  queueSongImgClick(songObjPos) {
    this.player.skipTo(songObjPos);
    let songObj = this.state.currentQueue[songObjPos];
    this.setState({
      currentSong: songObj,
      currentSongIndex: songObjPos,
      mainPlayerImg: songObj.image,
      playBtnClass: "playBtn-inactive",
      pauseBtnClass: "pauseBtn-active"
    });
  }

  skipSong(direction) {
    let index = 0;
    if (direction === "prev") {
      index = this.state.currentSongIndex - 1;
      if (index < 0) {
        index = this.state.currentQueue.length - 1;
      }
    } else {
      index = this.state.currentSongIndex + 1;
      if (index >= this.state.currentQueue.length) {
        index = 0;
      }
    }
    this.queueSongImgClick(index);
  }

  shuffleQueue() {
    let currentQueue = this.state.currentQueue;
    let currentSongIndex = this.state.currentSongIndex;
    let currentSong = this.state.currentSong;
    let newPlaylist = [];
    console.log(currentQueue);
    if (this.state.currentQueue.length > 1) {
      for (let i=0; i<currentQueue.length; i++) {
        if (i != currentSongIndex) {
          newPlaylist.push(currentQueue[i]);
        }
      }
      shuffleArray(newPlaylist);
      this.player.shuffle(newPlaylist);
      newPlaylist.splice(currentSongIndex, 0, currentSong);
      console.log(newPlaylist);
      this.setState({
        currentQueue: newPlaylist,
      });
    }
  }

  shufflePlayCollection(songObjArray) {
    let newPlaylist = songObjArray;
    shuffleArray(newPlaylist);
    this.playSinglePlaylist(newPlaylist, 0);
  }

  queueList() {
    if (this.state.currentQueue.length !== 0) {
      let i = -1;
      return this.state.currentQueue.map(currentSongQueue => {
        i++
        let queueBarHighlight = this.state.currentSongIndex === i ? "queue-song-container-active" : "queue-song-container-inactive"
        return <SongQueueDisplay song={currentSongQueue} key={i} pos={i} removeFromQueue={this.removeFromQueue} queueSongImgClick={this.queueSongImgClick} queueBarHighlight={queueBarHighlight}/>
    })
    } else {
      return;
    }
  }

  render() {
    return (
      <Router>
        <div className="page">
          <Navbar />
          <Route exact path="/">
            <HomePage playSingleSong={this.playSingleSong} addToQueueNewQueueSong={this.addToQueueNewQueueSong} playNextQueueSong={this.playNextQueueSong} currentSongIndex={this.state.currentSongIndex}
              playSinglePlaylist={this.playSinglePlaylist} shufflePlayCollection={this.shufflePlayCollection} />
          </Route>
          <Route path="/explore">
            <Explore />
          </Route>
          <Route path="/library">
            <Library 
              playSingleSong={this.playSingleSong} addToQueueNewQueueSong={this.addToQueueNewQueueSong} 
              playNextQueueSong={this.playNextQueueSong} currentSongIndex={this.state.currentSongIndex}
              playSinglePlaylist={this.playSinglePlaylist} shufflePlayCollection={this.shufflePlayCollection}
            />
          </Route>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route 
            path="/playlist/:id" 
            render={(props) => <PlaylistPage {...props} shufflePlayCollection={this.shufflePlayCollection} 
              playSinglePlaylist={this.playSinglePlaylist} addToQueueNewQueueSong={this.addToQueueNewQueueSong} 
              playNextQueueSong={this.playNextQueueSong} />}
          />
          <Route
            path="/search/:searchQuery"
            render={(props) => <SearchResultPage {...props} playSingleSong={this.playSingleSong} addToQueueNewQueueSong={this.addToQueueNewQueueSong}
              playNextQueueSong={this.playNextQueueSong} /> }
          />
          <Route
            path="/album/:id"
            render={(props) => <AlbumPage {...props} shufflePlayCollection={this.shufflePlayCollection}
              playSinglePlaylist={this.playSinglePlaylist} addToQueueNewQueueSong={this.addToQueueNewQueueSong}
              playNextQueueSong={this.playNextQueueSong} />}
          />
          <Route 
            path="/artist/:id"
            render={(props) => <ArtistPage {...props} shufflePlayCollection={this.shufflePlayCollection}
              playSinglePlaylist={this.playSinglePlaylist} addToQueueNewQueueSong={this.addToQueueNewQueueSong}
              playNextQueueSong={this.playNextQueueSong} />}
          />
          <div className="container-fluid px-0 player-body" ref={div => this.playerBodyElem = div }>
            {/* Img and queue container */}
            <div className="row player-container">
              <CurrentSongQueueImg mainPlayerImg={this.state.mainPlayerImg} />
              {/* <!--Queue container--> */}
              <div className="col-5">
                <div className="row" id="allSongsContainer">
                  {/* <!--UP Next Header--> */}
                  <div className="col-12 up-next-text-wrapper">
                    <h4>UP NEXT</h4>
                    <hr/>
                  </div>
                  {/* <!--/UP Next Header--> */}
                  {/* <!--Queue Song wrapper--> */}
                  {this.queueList()}
                  {/* <!--/Queue Song wrapper--> */}
                </div>
              </div>
              {/* <!--/Queue container--> */}
            </div>
            {/* <!--/Img and queue container--> */}
          </div>
          <div className="container-fluid px-0 player-controls-body" ref={div => this.playerControlsElem = div}>
            {/* <!--Song controls container--> */}
            <Controls 
              slidePlayerBtnClick={this.slidePlayerBtnClick} 
              currentSong={this.state.currentSong} 
              player={this.player} 
              trueSongDuration={this.state.trueSongDuration} 
              currentTimer={this.state.currentTimer} 
              scrubTimer={this.scrubTimer} 
              skipSong={this.skipSong} 
              shuffleQueue={this.shuffleQueue} 
              removeFromQueue={this.removeFromQueue}
              playBtnClass={this.state.playBtnClass}
              pauseBtnClass={this.state.pauseBtnClass}
              showPauseBtn={this.showPauseBtn}
              showPlayBtn={this.showPlayBtn}
              currentPos={this.state.currentSongIndex}
            />
            {/* <!--/Song controls container--> */}
          </div>
        </div>
      </Router>
    )
  }
}