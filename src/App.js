import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
// UI Component
import Header from './layouts/header/Header';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        {this.props.children}
        <div className="footer">
          <Container>
            <Row>
              <Col className="text-center">
                View our project on Github. Made with love by BitVideos fundation. 2018
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    );
  }
}
