import React, { Component } from 'react';
import { Navbar, Nav, NavItem, NavbarToggler, Collapse } from 'reactstrap';
import { HiddenOnlyAuth, VisibleOnlyAuth } from '../../util/wrappers.js';
import { Link } from 'react-router';

// Styles
import './Header.css';

// UI Components
import LoginButton from '../../user/ui/loginbutton/LoginButton';
import LogoutButton from '../../user/ui/logoutbutton/LogoutButton';

export default class Header extends Component {
  state: Object = {
    isOpen: false
  }
  toggleNav: Function = () => {
    this.setState({
      isOpen: !this.state.isOpen
    })
  }
  render() {
    const OnlyAuthLinks = VisibleOnlyAuth(() =>
      <Nav className="ml-auto" navbar>
        <NavItem>
          <Link className="nav-link" to="/fanplace">Fan Place</Link>
        </NavItem>
        <NavItem>
          <Link className="nav-link" to="/profile">Profile</Link>
        </NavItem>
        <LogoutButton />
      </Nav>
    )

    const OnlyGuestLinks = HiddenOnlyAuth(() =>
      <Nav className="ml-auto" navbar>
        <NavItem>
          <Link className="nav-link" to="/signup">Sign Up</Link>
        </NavItem>
          <LoginButton />
      </Nav>
    )

    return (
      <div className="header">
        <Navbar color="light" light expand="md">
          <Link className="nav-brand" to="/">
            <img role="presentation" className="home-image" src="/img/logo.png" />
          </Link>
          <NavbarToggler onClick={this.toggleNav} />
            <Collapse isOpen={this.state.isOpen} navbar>
              <OnlyAuthLinks />
              <OnlyGuestLinks />
            </Collapse>
        </Navbar>
      </div>)
  }
}
