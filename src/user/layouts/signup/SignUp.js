import React, { Component } from 'react';
import SignUpForm from '../../ui/signupform/SignUpForm';

// Styles
import './SignUp.css';

export default class SignUp extends Component {
  render() {
    return(
      <main className="container signup-container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>Sign Up</h1>
            <p>We've got your wallet information, simply input your nickname and your account is made!</p>
            <SignUpForm />
          </div>
        </div>
      </main>
    )
  }
}
