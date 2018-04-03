import React, { Component } from 'react';
import { HiddenOnlyAuth, VisibleOnlyAuth } from '../../util/wrappers.js';
import { Link } from 'react-router';

// Styles
import './Header.css';

// UI Components
import LoginButton from '../../user/ui/loginbutton/LoginButton';
import LogoutButton from '../../user/ui/logoutbutton/LogoutButton';

export default class Header extends Component {
  render() {
    const OnlyAuthLinks = VisibleOnlyAuth(() =>
      <span>
        <li className="pure-menu-item">
          <Link to="/marketplace" className="pure-menu-link">Market Place</Link>
        </li>
        <li className="pure-menu-item">
          <Link to="/profile" className="pure-menu-link">Profile</Link>
        </li>
        <LogoutButton />
      </span>
    )

    const OnlyGuestLinks = HiddenOnlyAuth(() =>
      <span>
        <li className="pure-menu-item">
          <Link to="/signup" className="pure-menu-link">Sign Up</Link>
        </li>
        <LoginButton />
      </span>
    )

    return (
      <div className="header">
        <div className="home-menu pure-menu pure-menu-horizontal">
          <Link className="pure-menu-heading" to="/"><img role="presentation" className="home-image" src="/img/logo.png" /></Link>
          <ul className="pure-menu-list">
            <OnlyAuthLinks />
            <OnlyGuestLinks />
          </ul>
        </div>
      </div>)
  }
}
