import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Col, Row, Button, Collapse, Alert } from 'reactstrap';
import { asyncLoadUserVideos } from './ProfileActions';
import { showPayoutDialog } from '../../../layouts/ui/payoutdialog/PayoutDialogAction';

// UI Component
import MyVideoComponent from '../../../layouts/ui/videocomp/MyVideoComponent';
import ProfileForm from '../../ui/profileform/ProfileForm';
import ProposeForm from '../../ui/proposeform/ProposeForm';
import SellVideoDialog from '../../../layouts/ui/sellvideodialog/SellVideoDialog';
import PayoutDialog from '../../../layouts/ui/payoutdialog/PayoutDialog';
import Spinner from '../../../layouts/ui/spinner/Spinner';

@connect(
    state => ({
      videos: state.user.userVideos,
      web3: state.web3.web3Instance,
      user: state.user.data
    }),
    {
      asyncLoadUserVideos,
      showPayoutDialog
    })
export default class Profile extends Component {
  state: Object = {
    showEdit: false,
    showPropse: false
  }
  componentDidMount() {
    this.props.asyncLoadUserVideos();
  }
  togglePropose: Function = () => {
    this.setState({
      showPropose: !this.state.showPropose
    })
  }
  toggleEdit: Function = () => {
    this.setState({
      showEdit: !this.state.showEdit
    })
  }
  render() {
    return(
      <Container>
        <Row>
          { this.props.videos
            ? <Col xs="12" md="9" lg="9">
            <Row>
              <Col>
                <h2>My Videos <Button color="primary" size="sm" outline onClick={this.togglePropose}>{this.state.showPropose ? 'Hide' : 'Propose New Video'}</Button></h2>
              </Col>
            </Row>
            <Row>
              <Col>
                <Collapse isOpen={this.state.showPropose}>
                  <ProposeForm />
                </Collapse>
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
          : <Spinner /> }
          <Col xs="12" md="3" lg="3">
            <Row>
              <Col xs="12" md="12">
                <b>Nick:</b> {this.props.user.name}
              </Col>
            </Row>
            <Row>
              <Col xs="12" md="12">
                <Button color="primary" size="sm" outline onClick={this.toggleEdit}>Edit</Button>
              </Col>
            </Row>
            <Row>
              <Col xs="12" md="12">
                <b>BTVC:</b> {this.props.user.BTVCBalance} ({this.props.user.BTVCBalance/this.props.user.BTVCTotalSupply*100}%)
              </Col>
            </Row>
            <Row>
              <Col xs="12" md="12">
                <Button color="primary" size="sm" outline onClick={this.props.showPayoutDialog}>Payout</Button>
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
            <Row>
              <Col xs="12" md="12">

              </Col>
            </Row>
          </Col>
        </Row>
        <SellVideoDialog className="buy-dialog" />
        <PayoutDialog className="buy-dialog" />
      </Container>
    )
  }
}
