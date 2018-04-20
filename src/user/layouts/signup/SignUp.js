import React, { Component } from 'react';
import SignUpForm from '../../ui/signupform/SignUpForm';
import { Container, Col, Row } from 'reactstrap';

// Styles
import './SignUp.css';

export default class SignUp extends Component {
  render() {
    return(
      <Container>
        <Row>
          <Col>
            <h2>Sign Up</h2>
            <p>We've got your wallet information, simply input your nickname and your account is made!</p>
            <SignUpForm />
          </Col>
        </Row>
      </Container>
    )
  }
}
