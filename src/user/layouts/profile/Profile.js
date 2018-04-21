import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Col, Row, Button, Collapse, Alert } from 'reactstrap';
import { asyncLoadUserVideos } from './ProfileActions';

// UI Component
import MyVideoComponent from '../../../layouts/ui/videocomp/MyVideoComponent';
import ProfileForm from '../../ui/profileform/ProfileForm';
import SellVideoDialog from '../../../layouts/ui/sellvideodialog/SellVideoDialog';

@connect(
    state => ({
      videos: state.user.userVideos,
      web3: state.web3.web3Instance,
      name: state.user.data.name
    }),
    {
      asyncLoadUserVideos
    })
export default class Profile extends Component {
  state: Object = {
    showEdit: false
  }
  componentDidMount() {
    this.props.asyncLoadUserVideos();
  }
  toggleEdit: Function = () => {
    this.setState({
      showEdit: !this.state.showEdit
    })
  }
  render() {
    console.log(this.props.videos);
    return(
      <Container>
        <Row>
          <Col xs="12" md="10" lg="10">
            <Row>
              <Col>
                <h2>My Videos</h2>
              </Col>
            </Row>
            { this.props.videos.length === 0
              ? <Alert color="primary">
                You don't have any video yet ---- Subscribe one in the Fanplace!
              </Alert> : null
            }
            <Row>
              { this.props.videos.map((video, index) => {
                return (
                  <Col xs="12" md="6" lg="6" key={video.videoId + index }>
                    <MyVideoComponent videoData={video} />
                  </Col>
                )
              })}
            </Row>
          </Col>
          <Col xs="12" md="2" lg="2">
            <Row>
              <Col xs="12" md="12">
                <h4>Hello, {this.props.name}</h4>
              </Col>
            </Row>
            <Row>
              <Col xs="12" md="12">
                <Button color="primary" size="sm" outline onClick={this.toggleEdit}>{ this.state.showEdit ? 'Hide' : 'Edit' }</Button>
              </Col>
            </Row>
            <Row>
              <Col>
                <Collapse isOpen={this.state.showEdit}>
                  <p>Edit your account details here.</p>
                  <ProfileForm />
                </Collapse>
              </Col>
            </Row>
          </Col>
        </Row>
        <SellVideoDialog className="buy-dialog" />
      </Container>
    )
  }
}
