import React, {Component} from 'react';

const ItemWithFeatures = (WrappedComponent) => {
  return class ItemWithFeatures extends Component {
    constructor(props) {
      super(props);
      this.state = {
        anchorEl: null,
      }

      // For popup menu
      this.handleClick = this.handleClick.bind(this);
      this.handleClose = this.handleClose.bind(this);
      this.setAnchorEl = this.setAnchorEl.bind(this);

      // Menu options
      this.playNextClick = this.playNextClick.bind(this);
      this.addToQueueClick = this.addToQueueClick.bind(this);
      this.addToLibraryClick = this.addToLibraryClick.bind(this);
      this.removeFromLibraryClick = this.removeFromLibraryClick.bind(this);
    }

    handleClick(event) {
      this.setAnchorEl(event.currentTarget);
    }
  
    handleClose() {
      this.setAnchorEl(null);
    }
  
    setAnchorEl(value) {
      this.setState({
        anchorEl: value
      })
    }

    playNextClick() {
      this.props.playNext(this.props.data)
      this.handleClose();
    }

    addToQueueClick() {
      this.props.addToQueue(this.props.data);
      this.handleClose();
    }

    removeFromLibraryClick() {
      this.props.removeFromLibrary(this.props.data);
      this.handleClose();
    }

    addToLibraryClick() {
      this.props.addToLibrary(this.props.data);
      this.handleClose();
    }

    render() {
      return(
        <WrappedComponent 
          handleClick={this.handleClick}
          handleClose={this.handleClose}
          setAnchorEl={this.setAnchorEl}
          anchorEl={this.state.anchorEl}
          playNextClick={this.playNextClick}
          addToQueueClick={this.addToQueueClick}
          addToLibraryClick={this.addToLibraryClick}
          removeFromLibraryClick={this.removeFromLibraryClick}
          {...this.props}
        />
      ) 
    }
  }
}

export default ItemWithFeatures;