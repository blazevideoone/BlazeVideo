import React, { Component } from 'react';
import YouTube from 'react-youtube';
import { Button, Badge } from 'reactstrap';
import { showBuyVideoDialog } from '../buyvideodialog/BuyVideoDialogAction';
import { connect } from 'react-redux';

// Styles
import './VideoComponent.css';

@connect(
    state => ({
      user: state.user.data
    }),
    {
      showBuyVideoDialog
    })
export default class VideoComponent extends Component {
  getActionButton: Function = () => {
    if (!this.props.user) {
      return (<Button color='primary' outline className="buy-button">SIGNUP TO PLAY</Button>);
    } else if ( this.props.user.account !== this.props.videoData.owner) {
      return (<Button color={this.props.videoData.isForced ? 'warning' : 'primary'} className="buy-button" onClick={() => this.props.showBuyVideoDialog(this.props.videoData)}>{this.props.videoData.isForced ? 'FORCE SUBSCRIBE' : 'SUBSCRIBE'}</Button>);
    } else {
      return (<Button color='primary' outline className="buy-button">YOUR VIDEO</Button>);
    }
  }
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
          View Counts: {this.props.videoData.viewCount}
        </div>
        <div className="video-box">
          <YouTube
            videoId={this.props.videoData.videoId}
            opts={opts}
          />
        </div>
        <div className="price-box">
          <span className="price"><b>PRICE: </b>{ this.props.videoData.price }<b> &Xi; </b></span>
          { this.props.videoData.owner !== '0x627306090abaB3A6e1400e9345bC60c78a8BEf57' ? <Badge color="info" pill>{ this.props.videoData.ownerName }</Badge> : <Badge color="alert" pill>New!</Badge> }
          {this.getActionButton()}
        </div>
      </div>
    );
  }
}
