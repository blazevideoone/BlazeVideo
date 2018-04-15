import React, { Component } from 'react';
import YouTube from 'react-youtube';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import { showSellVideoDialog } from '../sellvideodialog/SellVideoDialogAction';

// Styles
import './VideoComponent.css';

@connect(
    state => ({}),
    {
      showSellVideoDialog
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
          <span className="price">EST: { this.props.videoData.viewCount/1000000000 } E</span>
          <Button color='primary' className="buy-button" onClick={() => this.props.showSellVideoDialog(this.props.videoData)}>SELL</Button>
        </div>
      </div>
    );
  }
}
