import React, { Component } from 'react';
import YouTube from 'react-youtube';
// import { connect } from 'react-redux';

// Styles
import './VideoComponent.css';

// @connect(
//     state => ({}),
//     {
//     })
export default class VideoComponent extends Component {
  render() {
    const opts = {
      height: '320',
      width: '240',
      playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 0
      }
    };

    return (
      <div className="video-card">
        <YouTube
          videoId={this.props.videoData.youtubeId}
          opts={opts}
        />
        <div className="price-box">
          <span className="price">{ this.props.videoData.videoCount/1000000 } ETH</span>
          <button className="pure-button">Buy</button>
        </div>
      </div>
    );
  }
}
