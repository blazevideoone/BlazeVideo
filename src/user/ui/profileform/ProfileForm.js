import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, FormGroup, Label, Input, Button, FormText } from 'reactstrap';
import { updateUser } from './ProfileFormActions';

@connect(
    state => ({
      name: state.user.data.name
    }),
    {
        updateUser
    })
export default class ProfileForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: this.props.name
    }
  }

  onInputChange: Function = (event) => {
    this.setState({ name: event.target.value })
  }

  handleSubmit: Function = (event) => {
    event.preventDefault()

    if (this.state.name.length < 2)
    {
      return alert('Please fill in your name.')
    }
    this.props.updateUser(this.state.name)
  }

  render() {
    return(
      <Form onSubmit={this.handleSubmit}>
        <FormGroup>
          <Label>Name</Label>
          <Input id="name" type="text" value={this.state.name} onChange={this.onInputChange} placeholder="Name" />
          <FormText color="muted">This is a required field.</FormText>
        </FormGroup>
        <Button color="primary" type="submit">Update</Button>
      </Form>
    )
  }
}
