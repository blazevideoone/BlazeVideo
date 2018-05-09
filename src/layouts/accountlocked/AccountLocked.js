import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';

export default class AccountLocked extends Component {
  render() {
    return(
      <Container>
        <Row>
          <Col className="text-center">
            <a href="https://metamask.io" target="blank"><img src="img/download-metamask.png" width="500px" style={{margin: '50px auto'}}alt="Download Metamask"/></a>
          </Col>
        </Row>
        <Row>
          <Col>
            <p style={{textAlign: 'center'}}>The MetaMask is not installed or locked. <br />Please install or unlock MetaMask and go Back.</p>
          </Col>
        </Row>
      </Container>
    )
  }
}
