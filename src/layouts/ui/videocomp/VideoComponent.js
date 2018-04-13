import React, { Component } from 'react';
import YouTube from 'react-youtube';
import { Button } from 'reactstrap';
import { showBuyVideoDialog } from '../buyvideodialog/BuyVideoDialogAction';
import { connect } from 'react-redux';

// Styles
import './VideoComponent.css';

@connect(
    state => ({}),
    {
      showBuyVideoDialog
    })
export default class VideoComponent extends Component {
  render() {
    const opts = {
      height: '240',
      width: '320',
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
          <span className="price">RESERVED PRICE: { this.props.videoData.price } ETH</span>
          <Button color='primary' className="buy-button" onClick={() => this.props.showBuyVideoDialog(this.props.videoData)}>BUY</Button>
        </div>
      </div>
    );
  }
}
