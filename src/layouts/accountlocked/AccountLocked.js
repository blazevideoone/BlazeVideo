import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';

export default class AccountLocked extends Component {
  render() {
    return(
      <Container>
        <Row>
          <Col>
            <h2>The MetaMask is not installed or locked.</h2>
          </Col>
        </Row>
      </Container>
    )
  }
}
