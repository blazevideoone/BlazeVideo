import React, { Component } from 'react';
import YouTube from 'react-youtube';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import { showSellVideoDialog } from '../sellvideodialog/SellVideoDialogAction';
import { asyncCancelAuction } from './VideoComponentAction';

// Styles
import './VideoComponent.css';

@connect(
    state => ({}),
    {
      showSellVideoDialog,
      asyncCancelAuction
    })
export default class VideoComponent extends Component {
  render() {
    const opts = {
      height: '180',
      width: '280',
      playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 0
      }
    };

    return (
      <div className="video-card">
        <div className="title-box">
          View Count: {this.props.videoData.viewCount}
        </div>
        <div className="video-box">
          <YouTube
            videoId={this.props.videoData.videoId}
            opts={opts}
          />
        </div>
        <div className="price-box">
          { this.props.videoData.isForced
            ? <div>
              <span className="price">EST: { this.props.videoData.price } E</span>
              <Button color='primary' className="buy-button" onClick={() => this.props.showSellVideoDialog(this.props.videoData)}>TRANSFER</Button>
            </div>
            : <div>
              <span className="price">PRICE: { this.props.videoData.price } E</span>
              <Button color='primary' className="buy-button" onClick={() => this.props.asyncCancelAuction(this.props.videoData.tokenId)}>CANCEL</Button>
            </div> }
        </div>
      </div>
    );
  }
}
