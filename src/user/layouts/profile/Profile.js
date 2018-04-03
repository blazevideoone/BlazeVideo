import React, { Component } from 'react';
import { connect } from 'react-redux';
import ProfileForm from '../../ui/profileform/ProfileForm';

@connect(
    state => ({
      videos: state.videos.data,
      web3: state.web3.web3Instance
    }))
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
          <div className="pure-u-1-1">
            <h1>My Videos</h1>
            <p><strong>Total Supply: </strong>{this.props.videos.totalSupply}</p>
            <ul>
              {
                this.props.videos.myList.map( video => {
                  return <div key={video}>{ this.props.web3.toAscii(video) }</div>;
                })
              }
            </ul>
          </div>
        </div>
      </main>
    )
  }
}
