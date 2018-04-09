import React, { Component } from 'react';
import YouTube from 'react-youtube';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';

// Styles
import './VideoComponent.css';

@connect(
    state => ({}),
    {
    })
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
        <div className="title-box">
          Youtube Video: {this.props.videoData.youtubeId}
        </div>
        <div className="video-box">
          <YouTube
            videoId={this.props.videoData.youtubeId}
            opts={opts}
          />
        </div>
        <div className="price-box">
          <span className="price">Estimate: { this.props.videoData.videoCount/1000000 } ETH</span>
          <Button color='primary' className="buy-button">SELL</Button>
        </div>
      </div>
    );
  }
}
