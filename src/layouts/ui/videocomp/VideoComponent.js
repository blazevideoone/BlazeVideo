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
      height: '180',
      width: '240',
      playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 0
      }
    };

    return (
      <div className="video-card">
        <div className="title-box">
          Youtube Video: {this.props.videoData.videoId}
        </div>
        <div className="video-box">
          <YouTube
            videoId={this.props.videoData.videoId}
            opts={opts}
          />
        </div>
        <div className="price-box">
          <span className="price">PRICE: { this.props.videoData.price } E</span>
          <Button color='primary' className="buy-button" onClick={() => this.props.showBuyVideoDialog(this.props.videoData)}>BUY</Button>
        </div>
      </div>
    );
  }
}
