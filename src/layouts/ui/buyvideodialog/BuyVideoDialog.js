// buy video dialog file
import React, { Component } from 'react';
import YouTube from 'react-youtube';
import { Modal, ModalBody, ModalHeader, ModalFooter, Row, Col, Button, Input, InputGroup, InputGroupAddon, Alert } from 'reactstrap';
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
  state: Object = {
    price: this.props.data.videoData ? this.props.data.videoData.price : 0.00,
    showAlert: false,
    alertText: ''
  }
  toggle: Function = () => {
    this.props.hideBuyVideoDialog();
  }
  componentWillReceiveProps(props) {
    this.setState({
      price: props.data.videoData ? props.data.videoData.price : 0.00,
    })
  }
  changePrice: Function = (event) => {
    this.setState({
      price: event.target.value
    })
  }
  bidNow: Function = () => {
    console.log(this.state, this.props.data);
    if (this.state.price < this.props.data.videoData.price) {
      this.setState({
        showAlert: true,
        alertText: `WARNING: Your price ${this.state.price} ETH is lower than the reserved price ${this.props.data.videoData.price} ETH of this video`
      });
      setTimeout(() => this.setState({
        showAlert: false,
        alertText: ''
      }), 3000);
    }
  }
  render() {
    const opts = {
      height: '300',
      width: '465',
      playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 0
      }
    };
    return (
      <Modal isOpen={ this.props.data.modalShow } toggle={this.toggle} className={this.props.className}>
        <ModalHeader toggle={this.toggle}>Buy Video</ModalHeader>
        <ModalBody>
        { this.state.showAlert && <Alert color="danger">
          { this.state.alertText }
        </Alert> }
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
          <InputGroup>
            <Input type="number" value={this.state.price} onChange={this.changePrice} />
            <InputGroupAddon addonType="append">ETH</InputGroupAddon>
          </InputGroup>
          <Button color="primary" onClick={this.bidNow}>BID NOW</Button>
          <Button color="secondary" onClick={this.toggle}>BACK</Button>
        </ModalFooter>
      </Modal>
    );
  }
}
