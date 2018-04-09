import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavItem, NavLink } from 'reactstrap';
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
      <NavItem>
        <NavLink href="#" onClick={this.onLoginUserClick}>Login</NavLink>
      </NavItem>
    )
  }
}
