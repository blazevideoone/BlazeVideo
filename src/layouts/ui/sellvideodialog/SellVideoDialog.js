// buy video dialog file
import React, { Component } from 'react';
import YouTube from 'react-youtube';
import { Modal, ModalBody, ModalHeader, ModalFooter, Row, Col, Button, Input, InputGroup, InputGroupAddon, Alert } from 'reactstrap';
import { connect } from 'react-redux';
import { hideSellVideoDialog, asyncSellVideo } from './SellVideoDialogAction';

@connect(
  state => ({
    data: state.dialog.sellVideo
  }),
  {
    hideSellVideoDialog,
    asyncSellVideo
  })
export default class SellVideoDialog extends Component {
  state: Object = {
    price: this.props.data.videoData ? this.props.data.videoData.price : 0.00,
    showAlert: false,
    alertText: ''
  }
  toggle: Function = () => {
    this.props.hideSellVideoDialog();
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
  sellNow: Function = () => {
    if (this.state.price > 0) {
      this.props.asyncSellVideo(this.props.data.videoData.tokenId, this.state.price);
    } else {
      alert('The price cannot be 0!');
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
        <ModalHeader toggle={this.toggle}>Sell V+</ModalHeader>
        <ModalBody>
        { this.state.showAlert && <Alert color="danger">
          { this.state.alertText }
        </Alert> }
        { this.props.data.videoData ?
          <Row>
            <Col xs="12" md="12">
              <div className="video-box">
                <YouTube
                  videoId={this.props.data.videoData.videoId}
                  opts={opts}
                />
              </div>
            </Col>
            <Col xs="12" md="12">
              You are going to SELL V+: { this.props.data.videoData.videoId }
            </Col>
          </Row> : null }
        </ModalBody>
        <ModalFooter>
          <InputGroup>
            <Input type="number" value={this.state.price} onChange={this.changePrice} />
            <InputGroupAddon addonType="append">&Xi;</InputGroupAddon>
          </InputGroup>
          <Button color="primary" onClick={this.sellNow}>SELL V+ NOW</Button>
          <Button color="secondary" onClick={this.toggle}>BACK</Button>
        </ModalFooter>
      </Modal>
    );
  }
}
