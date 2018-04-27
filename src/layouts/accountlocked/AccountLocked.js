import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';

export default class AccountLocked extends Component {
  render() {
    return(
      <Container>
        <Row>
          <Col>
            <h3 style={{textAlign: 'center', color: '#FF0000'}}>The MetaMask is not installed or locked.</h3>
          </Col>
        </Row>
      </Container>
    )
  }
}
