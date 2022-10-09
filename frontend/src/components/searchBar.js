import { v4 as uuidv4 } from 'uuid';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import React, { Component } from 'react';
import searchService from '../services/searchService';
import { Link } from 'react-router-dom';

class SearchContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hideResults: true,
      searchResults: [],

    }
    this.searchResultsRowRef = React.createRef();
    this.searchBarRef = React.createRef();
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleSearchFocus = this.handleSearchFocus.bind(this);
    this.handleSearchUnFocus = this.handleSearchUnFocus.bind(this);
    this.getSearchResults = this.getSearchResults.bind(this);
    this.searchResultsClose = this.searchResultsClose.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleSearchUnFocus)
  }

  handleSearchChange(e) {
    if (e.target.value.length >= 3) {
      this.getSearchResults(e.target.value)
    }
    else {
      this.setState({ 
        searchResults: [],
      })
    }
  }

  getSearchResults(searchQuery) {
    searchService.getSearchQueryResults(searchQuery)
      .then(data => {
        this.setState({
          searchResults: data
        })
      })
  }

  handleSearchFocus() {
    this.setState({
      hideResults: false
    })
  }

  handleSearchUnFocus(event) {
    // console.log(event.target)
    if (!this.state.hideResults) {
      if (this.searchResultsRowRef && (!this.searchResultsRowRef.current.contains(event.target) && !this.searchBarRef.current.contains(event.target))) {
        console.log('Clicked outside')
        // console.log(this.searchResultsRowRef)
        this.setState({
          hideResults: true
        })
      }
    }
  }

  searchResultsClose() {
    this.setState({
      hideResults: true,
    })
  }

  results() {
    if (!this.state.hideResults) {
      if (this.state.searchResults.length ) {
        return this.state.searchResults.map(songResult => {
          let key = uuidv4();
          return <SearchRow result={songResult} key={key} searchResultsClose={this.searchResultsClose} />
        })
      }
    }
  }

  render() {
    return (
      <React.Fragment>
        <div ref={this.searchBarRef}> 
          <SearchBar handleSearchChange={this.handleSearchChange} 
            handleSearchFocus={this.handleSearchFocus} 
            // handleSearchUnFocus={this.handleSearchUnFocus}
          />
        </div>
        <div className="search-row-container" ref={this.searchResultsRowRef}>
          {this.results()}
        </div>
      </React.Fragment>
    )
  }
}

const SearchRow = (props) => {
  
  return (
    <div className="row search-row" onClick={() => {props.searchResultsClose()}}>
      <div className="col-12">
        <Link to={`/search/${props.result.title.toLowerCase()}`}><p>{props.result.title}</p></Link>
      </div>
    </div>
  )
}

const SearchBar = (props) => {
  return (
    <div className="">
      <InputBase
        className="search-bar"
        placeholder="Search"
        inputProps={{ 'aria-label': 'search google maps' }}
        onChange={props.handleSearchChange}
        onFocus={props.handleSearchFocus}
        onBlur={props.handleSearchUnFocus}
      />
      <IconButton type="submit" className="search-icon" aria-label="search">
        <SearchIcon />
      </IconButton>
    </div>
  )
}

export default SearchContainer;