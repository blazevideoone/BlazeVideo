// buy video dialog file
import React, { Component } from 'react';
import YouTube from 'react-youtube';
import { Modal, ModalBody, ModalHeader, ModalFooter, Row, Col, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { hideBuyVideoDialog } from './BuyVideoDialogAction';

@connect(
  state => ({
    data: state.dialog.buyVideo
  }),
  {
    hideBuyVideoDialog
  })
export default class BuyVideoDialog extends Component {
  toggle: Function = () => {
    this.props.hideBuyVideoDialog();
  }
  render() {
    const opts = {
      height: '320',
      width: '240',
      playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 0
      }
    };
    return (
      <Modal isOpen={ this.props.data.modalShow } toggle={this.toggle} className={this.props.className}>
        <ModalHeader toggle={this.toggle}>Buy Video</ModalHeader>
        <ModalBody>
        { this.props.data.videoData ?
          <Row>
            <Col xs="12" md="12">
              <div className="video-box">
                <YouTube
                  videoId={this.props.data.videoData.youtubeId}
                  opts={opts}
                />
              </div>
            </Col>
            <Col xs="12" md="12">
              You are going to purchase Video: { this.props.data.videoData.youtubeId }
            </Col>
          </Row> : null }
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.toggle}>BUY NOW</Button>
          <Button color="secondary" onClick={this.toggle}>BACK</Button>
        </ModalFooter>
      </Modal>
    );
  }
}
