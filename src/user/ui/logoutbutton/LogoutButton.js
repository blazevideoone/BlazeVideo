import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavItem, NavLink } from 'reactstrap';
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
      <NavItem>
        <NavLink href="#" onClick={this.onLogoutUserClick}>Logout</NavLink>
      </NavItem>
    )
  }
}
