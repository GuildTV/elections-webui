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

const SavePositionKey = "savePosition";

/*
* React
*/
export default class Position extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: undefined,
      type: 'candidate',
      fullName: '',
      compactName: '',
      miniName: ''
    }
  }

  LoadForm(data){
    if(data === null || data === undefined){
      this.setState({
        id: undefined,
        type: 'candidate',
        fullName: '',
        compactName: '',
        miniName: ''
      });
    } else {
      this.setState(data);
    }
  }

  handleFullNameChange(e) {
    this.setState({fullName: e.target.value});
  }
  handleCompactNameChange(e) {
    this.setState({compactName: e.target.value});
  }
  handleMiniNameChange(e) {
    this.setState({miniName: e.target.value});
  }

  handleTypeChange(e) {
    this.setState({type: e.target.value});
  }

  handleSubmit(e) {
    console.log(this.state);

    e.preventDefault();

    let {fullName, compactName, miniName, type} = this.state

    if (!fullName || !compactName || !miniName || !type) {
      //todo error handling
      return;
    }

    this.refs.sock.socket.emit(SavePositionKey, this.state)

    this.LoadForm();
  }

  render() {
    return (
      <div>
        <Socket.Event name={ SavePositionKey } ref="sock"/>

        <form onSubmit={this.handleSubmit.bind(this)}>
          <Input type="select" label="Type" placeholder="Choose a type:" onChange={this.handleTypeChange.bind(this)} value={this.state.type}>
            <option value="candidate">Candidate</option>
            <option value="other">Other</option>
          </Input>

          <Input type="text" label="Full Name" onChange={this.handleFullNameChange.bind(this)} value={this.state.fullName} />
          <Input type="text" label="Compact Name" onChange={this.handleCompactNameChange.bind(this)} value={this.state.compactName} />
          <Input type="text" label="Mini Name" onChange={this.handleMiniNameChange.bind(this)} value={this.state.miniName} />

          <ButtonInput type="submit" value="Save" bsStyle="primary" />
        </form>
      </div>
    );
  }
}
