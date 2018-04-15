import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'reactstrap';
import { asyncLoadVideoList, asyncAddNewVideoTrusted } from './FunplaceActions';

// CSS
import './Funplace.css';
// UI component
import VideoComponent from '../ui/videocomp/VideoComponent';
import BuyVideoDialog from '../ui/buyvideodialog/BuyVideoDialog';

@connect(
    state => ({
      videos: state.videos.data.auctionList,
      web3: state.web3.web3Instance
    }),
    {
        asyncLoadVideoList,
        asyncAddNewVideoTrusted
    })
export default class Funplace extends Component {
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
  render() {
    return(
      <Container>
        <Row>
          <Col>
            <h2>Funplace</h2>
          </Col>
        </Row>
        <Row>
          { this.props.videos.map((video, index) => {
            return (
              <Col xs="12" md="6" lg="4" key={video.videoId + index }>
                <VideoComponent videoData={video} />
              </Col>
            )
          })}
        </Row>
        <BuyVideoDialog className="buy-dialog" />
      </Container>
    )
  }
}
