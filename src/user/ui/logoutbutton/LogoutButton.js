import React, { Component } from 'react';
import { connect } from 'react-redux';
import { logoutUser } from './LogoutButtonActions';

@connect(
    state => ({}),
    {
        logoutUser
    })
export default class LogoutButton extends Component {
  onLogoutUserClick: Function = (event) => {
    event.preventDefault();
    this.props.logoutUser();
  }
  render() {
    return(
      <li className="pure-menu-item">
        <a href="#" className="pure-menu-link" onClick={this.onLogoutUserClick}>Logout</a>
      </li>
    )
  }
}
