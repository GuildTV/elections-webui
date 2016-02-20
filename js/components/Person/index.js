/*
* External Dependancies
*/

import React from 'react';
import update from 'react-addons-update'
import Socket from 'react-socket';

import { Input, ButtonInput } from 'react-bootstrap';

/*
* Variables
*/

const NewPersonKey = "newPerson";

/*
* React
*/
export default class Person extends React.Component {
  constructor(props) {
    super(props);

    this.state = {firstName: '', lastName: '', uid: '', type: 'talent', title: 'Host', manifesto: {one: '', two: '', three: ''}}
  }

  handleFirstNameChange(e) {
    this.setState({firstName: e.target.value});
  }
  handleLastNameChange(e) {
    this.setState({lastName: e.target.value});
  }

  handleUidChange(e) {
    this.setState({uid: e.target.value});
  }

  handleTypeChange(e) {
    this.setState({type: e.target.value});
  }
  handleTitleChange(e) {
    this.setState({title: e.target.value});
  }
  handleFirstManifestoPointChange(e) {
    let newState = update(this.state, {
      manifesto: {one: {$set: e.target.value}}
    })
    this.setState(newState);
  }

  handleSecondManifestoPointChange(e) {
    let newState = update(this.state, {
      manifesto: {two: {$set: e.target.value}}
    })
    this.setState(newState);
  }

  handleThirdManifestoPointChange(e) {
    let newState = update(this.state, {
      manifesto: {three: {$set: e.target.value}}
    })
    this.setState(newState);
  }

  handleSubmit(e) {
    console.log(this.state);

    e.preventDefault();

    let {firstName, lastName, uid, type, title, candidate, manifesto} = this.state

    if (!uid || !firstName || !lastName || !type || !title) {
      //todo error handling
      return;
    }

    let data = {
      firstName: firstName,
      lastName: lastName,
      uid: uid,
      type: type,
      title: title,
      candidate: candidate,
      manifesto: manifesto
    }

    this.refs.sock.socket.emit(NewPersonKey, data)
  }

  handleDataSaved(){

  }

  render() {
    return (
      <div>
        <Socket.Event name={ NewPersonKey } callback={ this.handleDataSaved } ref="sock"/>

        <form onSubmit={this.handleSubmit.bind(this)}>
          <Input type="text" label="First Name" onChange={this.handleFirstNameChange.bind(this)} />
          <Input type="text" label="Last Name" onChange={this.handleLastNameChange.bind(this)}/>
          <Input type="text" label="UID" placeholder="Enter a unique identifer - e.g. ado-ben" onChange={this.handleUidChange.bind(this)}/>
          <Input type="select" label="Type" placeholder="Choose a type:" onChange={this.handleTypeChange.bind(this)}>
            <option value="talent">Talent</option>
            <option value="candidate">Candidate</option>
            <option value="officer">Officer</option>
          </Input>
          <Input type="select" label="Title" placeholder="Choose a title:" onChange={this.handleTitleChange.bind(this)}>
            <option value="Host">Host</option>
            <option value="Roving Reporter">Roving Reporter</option>
            <option value="Political Commentator">Political Commentator</option>
            <option value="Activities & Development Officer">Activities & Development Officer</option>
            <option value="Anti-Racism, Anti Fascism Officer">Anti-Racism, Anti Fascism Officer</option>
            <option value="Community Action Officer">Community Action Officer</option>
            <option value="Disabled Students Officer">Disabled Students Officer</option>
            <option value="Ethical & Environmental Officer">Ethical & Environmental Officer</option>
            <option value="Ethnic Minority Students’ Officer">Ethnic Minority Students’ Officer</option>
            <option value="Education Officer">Education Officer</option>
            <option value="Housing & Community Officer">Housing & Community Officer</option>
            <option value="Home Students Officer">Home Students Officer</option>
            <option value="International Students Officer">International Students Officer</option>
            <option value="Lesbian, Gay, Bisexual, Trans and Queer Students Officer">Lesbian, Gay, Bisexual, Trans and Queer Students Officer</option>
            <option value="President">President</option>
            <option value="Representation & Resources Officer">Representation & Resources Officer</option>
            <option value="Sports Officer">Sports Officer</option>
            <option value="Satellite Sites Officer">Satellite Sites Officer</option>
            <option value="Welfare Officer">Welfare Officer</option>
            <option value="Womens Officer">Womens Officer</option>
          </Input>
          <Input type="text" label="First Manifesto Point" placeholder="First manifesto point" onChange={this.handleFirstManifestoPointChange.bind(this)}/>
          <Input type="text" label="Second Manifesto Point" placeholder="Second manifesto point" onChange={this.handleSecondManifestoPointChange.bind(this)}/>
          <Input type="text" label="Third Manifesto Point" placeholder="Third manifesto point" onChange={this.handleThirdManifestoPointChange.bind(this)} />
          <ButtonInput type="submit" value="Save" bsStyle="primary" />
        </form>
      </div>
    );
  }
}
