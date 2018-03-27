import React, { Component } from 'react';
import { connect } from 'react-redux';
import { loginUser } from './LoginButtonActions';

@connect(
    state => ({}),
    {
        loginUser
    })
export default class LoginButton extends Component {
  onLoginUserClick: Function = (event) => {
    event.preventDefault();
    this.props.loginUser();
  }
  render() {
    return(
      <li className="pure-menu-item">
        <a href="#" className="pure-menu-link" onClick={this.onLoginUserClick}>Login</a>
      </li>
    )
  }
}
