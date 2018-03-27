import React, { Component } from 'react';
import SignUpForm from '../../ui/signupform/SignUpForm';

export default class SignUp extends Component {
  render() {
    return(
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>Sign Up</h1>
            <p>We've got your wallet information, simply input your name and your account is made!</p>
            <SignUpForm />
          </div>
        </div>
      </main>
    )
  }
}
