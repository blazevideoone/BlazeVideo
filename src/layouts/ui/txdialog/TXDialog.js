// tx dialog file
import React, { Component } from 'react';
import { Modal, ModalBody, ModalHeader, ModalFooter, Row, Col, Button, Alert } from 'reactstrap';
import { connect } from 'react-redux';
import { hideTXDialog } from './TXDialogAction';

@connect(
  state => ({
    data: state.dialog.TX
  }),
  {
    hideTXDialog
  })
export default class TXDialog extends Component {
  toggle: Function = () => {
    this.props.hideTXDialog();
  }
  render() {
    const txData = this.props.data.txData;
    return (
      <Modal isOpen={ this.props.data.modalShow } size="lg" toggle={this.toggle} className={this.props.className}>
        <ModalHeader toggle={this.toggle}>TX Information</ModalHeader>
        { txData ?
          <ModalBody>
            <Row>
              <Col>
                <a href={`https://etherscan.io/tx/${txData.tx}`} target="blank" className="force-wrap centered">TX: { txData.tx }</a>
              </Col>
            </Row>
            <Row>
              <Col xs="12" md="2">blockHash:</Col>
              <Col xs="12" md="10" className="force-wrap">{txData.receipt.blockHash}</Col>
            </Row>
            <Row>
              <Col xs="12" md="2">blockNumber:</Col>
              <Col xs="12" md="10" className="force-wrap">{txData.receipt.blockNumber}</Col>
            </Row>
            <Row>
              <Col xs="12" md="2">gasUsed:</Col>
              <Col xs="12" md="10" className="force-wrap">{txData.receipt.gasUsed}</Col>
            </Row>
            {/* <Row>
              <Col xs="12" md="2">Data:</Col>
              <Col xs="12" md="10" className="force-wrap">
                {txData.receipt.logsBloom}
              </Col>
            </Row> */}
            <Alert color="danger">The TX need few minute to hours to broadcast on the Ethereum. For more TX information, please click the TX number and check on Etherscan.io.</Alert>
          </ModalBody>  : null }
        <ModalFooter>
          <Button color="secondary" onClick={this.toggle}>CLOSE</Button>
        </ModalFooter>
      </Modal>
    );
  }
}
