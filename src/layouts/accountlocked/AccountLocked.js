import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';

export default class AccountLocked extends Component {
  render() {
    return(
      <Container>
        <Row>
          <Col>
            <h3 style={{textAlign: 'center'}}>The MetaMask is not installed or locked. Please install or unlock MetaMask and go Back.</h3>
          </Col>
        </Row>
      </Container>
    )
  }
}
