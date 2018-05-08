import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, FormGroup, Label, Input, Button, FormText } from 'reactstrap';
import { proposeVideo } from './ProposeFormActions';

@connect(null,
    {
        proposeVideo
    })
export default class ProposeForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      youtubeId: ''
    }
  }

  onInputChange: Function = (event) => {
    this.setState({ youtubeId: event.target.value });
    console.log(this.state.youtubeId);
  }

  handleSubmit: Function = (event) => {
    event.preventDefault();
    if (this.state.youtubeId.length < 2)
    {
      return alert('Please fill in valid youtube video Id.')
    }
    this.props.proposeVideo(this.state.youtubeId);
  }

  render() {
    return(
      <Form onSubmit={this.handleSubmit}>
        <FormGroup>
          <Label>Youtube video ID:</Label>
          <Input id="youtubeId" type="text" value={this.state.youtubeId} onChange={this.onInputChange} placeholder="Youtube Id" />
          <FormText color="muted">Propose a new video will cost 0.0001 Ether.</FormText>
        </FormGroup>
        <Button color="primary" type="submit">Propose</Button>
      </Form>
    )
  }
}
