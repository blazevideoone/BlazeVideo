import React, { Component } from 'react';
import { connect } from 'react-redux';
import { asyncLoadVideoList, asyncAddNewVideoTrusted } from './MarketPlaceActions';

//UI component
import VideoComponent from '../ui/videocomp/VideoComponent';

@connect(
    state => ({
      videos: state.videos.data,
      web3: state.web3.web3Instance
    }),
    {
        asyncLoadVideoList,
        asyncAddNewVideoTrusted
    })
export default class MarketPlace extends Component {
  constructor(props, { authData }) {
    super(props);
    authData = this.props;
    this.state = {
      videoId: '',
      videoCount: 0
    }
  }
  componentWillMount() {
    this.props.asyncLoadVideoList();
  }
  onIdChange: Function = (event) => {
    this.setState({ videoId: event.target.value });
  }
  onCountChange: Function = (event) => {
    this.setState({ videoCount: event.target.value });
  }
  submitNewVideo: Function = (event) => {
    event.preventDefault();
    const YOUTUBE_PREFIX = "YUTB_";
    const { videoId, videoCount } = this.state;
    const YOUTUBE_VIDEO_ID = this.props.web3.fromAscii(YOUTUBE_PREFIX + videoId);
    this.props.asyncAddNewVideoTrusted(YOUTUBE_VIDEO_ID, videoCount);
  }
  render() {
    const testVideos = [
      {
        youtubeId: 'HPPj6viIBmU',
        videoCount: 23451
      },
      {
        youtubeId: 'HPPj6viIBmU',
        videoCount: 23451
      },
      {
        youtubeId: 'HPPj6viIBmU',
        videoCount: 23451
      },
      {
        youtubeId: 'HPPj6viIBmU',
        videoCount: 23451
      },
      {
        youtubeId: 'HPPj6viIBmU',
        videoCount: 23451
      },
      {
        youtubeId: 'HPPj6viIBmU',
        videoCount: 23451
      },
      {
        youtubeId: 'HPPj6viIBmU',
        videoCount: 23451
      },
      {
        youtubeId: 'HPPj6viIBmU',
        videoCount: 23451
      },
      {
        youtubeId: 'HPPj6viIBmU',
        videoCount: 23451
      },
      {
        youtubeId: 'HPPj6viIBmU',
        videoCount: 23451
      }
    ]
    return(
      <main className="container mp-container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>Market Place</h1>
          </div>
          { testVideos.map((video, index) => {
            return (
              <div key={video.youtubeId + index } className="pure-u-1-3">
                <VideoComponent videoData={video} />
              </div>
            )
          })}
          <div className="pure-u-1-1">
            <form className="pure-form pure-form-stacked" onSubmit={this.submitNewVideo}>
              <fieldset>
                <label htmlFor="name">Youtube ID</label>
                <input id="name" type="text" value={this.state.videoId} onChange={this.onIdChange} placeholder="Id" />
                <span className="pure-form-message">This is a required field.</span>

                <br />
                <label htmlFor="name">View Counts</label>
                <input id="name" type="number" value={this.state.videoCount} onChange={this.onCountChange} placeholder="Count" />
                <span className="pure-form-message">This is a required field.</span>

                <br />
                <button type="submit" className="pure-button pure-button-primary">Add Video</button>
              </fieldset>
            </form>
          </div>
        </div>
      </main>
    )
  }
}
