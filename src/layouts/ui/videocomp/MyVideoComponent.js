import React, { Component } from 'react';
import YouTube from 'react-youtube';
import { Button, UncontrolledTooltip } from 'reactstrap';
import { connect } from 'react-redux';
import { showSellVideoDialog } from '../sellvideodialog/SellVideoDialogAction';
import { asyncCancelAuction, asyncUpdateViewCount } from './VideoComponentAction';

// Styles
import './VideoComponent.css';

@connect(
    state => ({}),
    {
      showSellVideoDialog,
      asyncCancelAuction,
      asyncUpdateViewCount
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
          <Button size="sm" color="link" className="update-btn" id="update-button" onClick={() => this.props.asyncUpdateViewCount(this.props.videoData.tokenId)}>Earn BTVC</Button>
          <UncontrolledTooltip placement="right" target="update-button">
            Earn BTVC by update the viewcount of this V+ (cost 0.0001 ether). 100 BTVC per 1M viewcounts.
          </UncontrolledTooltip>
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
              <span className="price"><b>EST PRICE: </b>{ this.props.videoData.viewCount / 100000000 }<b> &Xi;</b></span>
              <Button color='primary' className="buy-button" onClick={() => this.props.showSellVideoDialog(this.props.videoData)}>SELL V+</Button>
            </div>
            : <div>
              <span className="price"><b>CURRENT PRICE: </b>{ this.props.videoData.price }<b> &Xi;</b></span>
              <Button color='warning' className="buy-button" onClick={() => this.props.asyncCancelAuction(this.props.videoData.tokenId)}>CANCEL SELL</Button>
            </div> }
        </div>
      </div>
    );
  }
}
