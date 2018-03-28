import React, { Component } from 'react';
import ProfileForm from '../../ui/profileform/ProfileForm';

export default class Profile extends Component {
  render() {
    return(
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>Profile</h1>
            <p>Edit your account details here.</p>
            <ProfileForm />
          </div>
        </div>
      </main>
    )
  }
}
