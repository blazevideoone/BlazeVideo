import React, { Component } from 'react';

// UI Component
import Header from './layouts/header/Header';

// Styles
import './css/pure-min.css';
import './App.css';

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        {this.props.children}
        <div className="footer l-box is-center">
            View our project on Github. Made with love by BitVideos fundation. 2018
        </div>
      </div>
    );
  }
}
