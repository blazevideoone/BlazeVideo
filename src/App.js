import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
// UI Component
import Header from './layouts/header/Header';
import TXDialog from './layouts/ui/txdialog/TXDialog';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        {this.props.children}
        <TXDialog />
        <div className="footer">
          <Container>
            <Row>
              <Col className="text-center">
                View our project on <a href="https://github.com/blazevideoone/BlazeVideo" target="blank">Github</a>. Made with love by BitVideo foundation. 2018
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    );
  }
}
