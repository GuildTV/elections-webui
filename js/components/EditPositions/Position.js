/*
* External Dependancies
*/

import React from 'react';
import update from 'react-addons-update'
import Socket from 'react-socket';

import { Input, ButtonInput, Button} from 'react-bootstrap';

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
      type: 'candidateSabb',
      fullName: '',
      compactName: '',
      miniName: ''
    }
  }

  LoadForm(data){
    if(data === null || data === undefined){
      this.setState({
        id: undefined,
        type: 'candidateSabb',
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
      alert("Missing input data");
      return;
    }

    this.refs.sock.socket.emit(SavePositionKey, this.state)

    this.LoadForm();
  }

  render() {
    return (
      <div>
        <Socket.Event name={ SavePositionKey } ref="sock"/>

        <form className="form-horizontal" onSubmit={this.handleSubmit.bind(this)}>
          <fieldset>
            <legend>Edit position</legend>

            <Input type="text" label="ID" labelClassName="col-xs-2" wrapperClassName="col-xs-10" disabled value={this.state.id} />
            <Input type="select" label="Type" labelClassName="col-xs-2" wrapperClassName="col-xs-10" placeholder="Choose a type:" 
              onChange={this.handleTypeChange.bind(this)} value={this.state.type}>
              <option value="candidateSabb">Candidate - Sabb</option>
              <option value="candidateNonSabb">Candidate - Non Sabb</option>
              <option value="other">Other</option>
            </Input>

            <Input type="text" label="Full Name" labelClassName="col-xs-2" wrapperClassName="col-xs-10" 
              onChange={this.handleFullNameChange.bind(this)} value={this.state.fullName} />
            <Input type="text" label="Compact Name" labelClassName="col-xs-2" wrapperClassName="col-xs-10"
              onChange={this.handleCompactNameChange.bind(this)} value={this.state.compactName} />
            <Input type="text" label="Mini Name" labelClassName="col-xs-2" wrapperClassName="col-xs-10"
              onChange={this.handleMiniNameChange.bind(this)} value={this.state.miniName} />


            TODO:
             - sidebarUseOfficer
             - order

            <Input label=" " labelClassName="col-xs-2" wrapperClassName="col-xs-10">
              <Button type="submit" bsStyle="primary">Save</Button>&nbsp;
              <Button bsStyle="warning" onClick={() => this.LoadForm()}>Clear</Button>
            </Input>
          </fieldset>
        </form>
      </div>
    );
  }
}
