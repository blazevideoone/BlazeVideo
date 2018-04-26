import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, ButtonDropdown, DropdownToggle, DropdownItem, DropdownMenu } from 'reactstrap';
import { asyncLoadVideoList, asyncAddNewVideoTrusted, sortByPrice, sortByViewCount } from './FanplaceActions';
import Spinner from '../ui/spinner/Spinner';
// CSS
import './Fanplace.css';
// UI component
import VideoComponent from '../ui/videocomp/VideoComponent';
import BuyVideoDialog from '../ui/buyvideodialog/BuyVideoDialog';

@connect(
    state => ({
      videos: state.videos.data.auctionList,
      web3: state.web3.web3Instance
    }),
    {
        asyncLoadVideoList,
        asyncAddNewVideoTrusted,
        sortByPrice,
        sortByViewCount,
    })
export default class Fanplace extends Component {
  constructor(props, { authData }) {
    super(props);
    authData = this.props;
    this.state = {
      videoId: '',
      videoCount: 0,
      dropdownOpen: false
    }
  }
  componentDidMount() {
    this.props.asyncLoadVideoList();
  }
  onIdChange: Function = (event) => {
    this.setState({ videoId: event.target.value });
  }
  onCountChange: Function = (event) => {
    this.setState({ videoCount: event.target.value });
  }
  toggleDropdown: Function = () => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    })
  }
  render() {
    return(
      <Container>
        <Row className="fanplace-toolbar">
          <Col xs="12" md="6">
            <h2>Fan Place</h2>
          </Col>
          <Col xs="12" md="6">
          <ButtonDropdown className="fanplace-dropdown" isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown}>
            <DropdownToggle color="light" caret>
              Sort Videos
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem onClick={() => this.props.sortByPrice(1)}>Price DESC</DropdownItem>
              <DropdownItem onClick={() => this.props.sortByPrice(-1)}>Price ASC </DropdownItem>
              <DropdownItem onClick={() => this.props.sortByViewCount(1)}>Viewcounts DESC</DropdownItem>
              <DropdownItem onClick={() => this.props.sortByViewCount(-1)}>ViewCounts ASC</DropdownItem>
            </DropdownMenu>
          </ButtonDropdown>
          </Col>
        </Row>
        <Row>
          { this.props.videos.map((video, index) => {
            return (
              <Col xs="12" md="6" lg="4" key={video.videoId + index }>
                <VideoComponent videoData={video} />
              </Col>
            )
          })}
        </Row>
        { this.props.videos.length === 0
          ? <Row><Spinner /></Row> : null
        }
        <BuyVideoDialog className="buy-dialog" />
      </Container>
    )
  }
}
