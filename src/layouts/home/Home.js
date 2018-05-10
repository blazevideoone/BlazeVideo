import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import { Link } from 'react-router';

class Home extends Component {
  render() {
    return(
      <div>
        <div className="light-bg home-splash">
          <div className="container">
            <div className="splash">
              <h1 className="splash-head"><span style={{color: "#FF0000"}}>Bit </span>Video.One</h1>
              <p className="splash-subhead">
                Buy V+ | Earn BTVC | Cashout ETH
              </p>
              <p>
                <Link to="/fanplace" className="btn btn-primary">START MINING</Link>
                <a href="https://t.me/bitvideo_dapp" className="btn btn-outline-primary">JOIN TELEGRAM GROUP</a>
              </p>
            </div>
          </div>
        </div>
        <div className="grey-bg home-splash">
          <div className="container">
            <Row>
              <Col xs="12" md="4" lg="4">
                <div className="home-badge">
                  <img alt="Buy V+" src="./img/vplus.png" />
                </div>
                <div className="home-title">
                  Buy V+
                </div>
                <div className="home-desc">
                  Buy and sell V+ linked to popular videos.
                </div>
              </Col>
              <Col xs="12" md="4" lg="4">
                <div className="home-badge">
                  <img alt="Earn BTVC" src="./img/btvc.png" />
                </div>
                <div className="home-title">
                  Earn BTVC
                </div>
                <div className="home-desc">
                  Update V+ with view count increament converted to BTVC. More popular, more BTVC.
                </div>
              </Col>
              <Col xs="12" md="4" lg="4">
                <div className="home-badge">
                  <img alt="Cashout ETH" src="./img/cashout.png" />
                </div>
                <div className="home-title">
                  Cashout ETH
                </div>
                <div className="home-desc">
                  Convert BTVC to ETH, share ETH from ecosystem.
                </div>
              </Col>
            </Row>
          </div>
        </div>
        <div className="light-bg">
          <div className="container">
            <div className="powered-by">
              <p className="splash-subhead">
                Powered By
              </p>
              <p>
                <a href="#"><img src="./img/ethereum.png" alt="ethereum" /></a>
                <a href="#"><img src="./img/metamask.png" alt="metamask" /></a>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Home
