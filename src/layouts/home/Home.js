import React, { Component } from 'react';
import { Link } from 'react-router';

class Home extends Component {
  render() {
    return(
      <div className="splash-container">
        <div className="splash">
          <h1 className="splash-head">Bit Video.One</h1>
          <p className="splash-subhead">
              Collects your faverate Youtube videos on a Blockchain.
          </p>
          <p>
            <Link to="/fanplace" className="btn btn-primary">Get Started</Link>
            <a href="https://t.me/bitvideo_dapp" className="btn btn-outline-primary">JOIN TELEGRAM GROUP</a>
          </p>
        </div>
      </div>
    )
  }
}

export default Home
