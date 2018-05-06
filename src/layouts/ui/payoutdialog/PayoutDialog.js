// buy video dialog file
import React, { Component } from 'react';
import { Modal, ModalBody, ModalHeader, ModalFooter, Row, Col, Button, Input, InputGroup, InputGroupAddon, Alert } from 'reactstrap';
import { connect } from 'react-redux';
import { hidePayoutDialog, asyncPayout } from './PayoutDialogAction';

@connect(
  state => ({
    data: state.dialog.payout
  }),
  {
    hidePayoutDialog,
    asyncPayout
  })
export default class PayoutDialog extends Component {
  state: Object = {
    amount: 0,
    showAlert: false,
    alertText: ''
  }
  toggle: Function = () => {
    this.props.hidePayoutDialog();
  }
  changeAmount: Function = (event) => {
    this.setState({
      amount: event.target.value
    })
  }
  payoutNow: Function = () => {
    if (this.state.amount > 0) {
      this.props.asyncPayout(this.state.amount);
    } else {
      alert('The amount cannot be 0!');
    }
  }
  render() {
    return (
      <Modal isOpen={ this.props.data.modalShow } toggle={this.toggle} className={this.props.className}>
        <ModalHeader toggle={this.toggle}>Payout BTVC</ModalHeader>
        <ModalBody>
        { this.state.showAlert && <Alert color="danger">
          { this.state.alertText }
        </Alert> }
          <Row>
            <Col xs="12" md="12">
              You can payout BTVC to Ether.
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <InputGroup>
            <Input type="number" value={this.state.amount} onChange={this.changeAmount} />
            <InputGroupAddon addonType="append">BTVC</InputGroupAddon>
          </InputGroup>
          <Button color="primary" onClick={this.payoutNow}>PAYOUT NOW</Button>
          <Button color="secondary" onClick={this.toggle}>BACK</Button>
        </ModalFooter>
      </Modal>
    );
  }
}
