/*
* External Dependancies
*/

import React from 'react';
import update from 'react-addons-update'
import Socket from 'react-socket';

import { Input, ButtonInput, Button } from 'react-bootstrap';

/*
* Variables
*/

const NewPersonKey = "savePerson";
const GetPositionsKey = "getPositions";

/*
* React
*/
export default class Person extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      _positions: [],
      id: undefined,
      firstName: '', 
      lastName: '', 
      uid: '', 
      positionId: '', 
      photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=',
      manifesto: {
        one: '', 
        two: '', 
        three: ''
      }
    };
  }


  LoadForm(data){
    console.log(data);
    if(data === null || data === undefined){
      this.setState({
        id: undefined,
        firstName: '', 
        lastName: '', 
        uid: '', 
        positionId: '', 
        photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=',
        manifesto: {
          one: '', 
          two: '', 
          three: ''
        }
      });
    } else {
      this.setState(data);
    }
  }

  componentDidMount() {
    this.refs.sock.socket.emit(GetPositionsKey)
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

  handlePositionChange(e) {
    this.setState({positionId: e.target.value});
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

  handlePhotoChange(e){
    var files = this.refs.fileUpload.getInputDOMNode().files;

    var reader = new FileReader();
    reader.onload = function(dat) {
      this.setState({ photo: dat.target.result });
    }.bind(this);
    reader.readAsDataURL( files[0] );
  }

  handleSubmit(e) {
    console.log(this.state);

    e.preventDefault();

    let {firstName, lastName, uid, id, positionId, manifesto, photo} = this.state;

    if (!uid || !firstName || !lastName || !positionId) {
      //todo error handling
      alert("Missing input data");
      return;
    }

    let data = {
      id,
      firstName,
      lastName,
      uid,
      positionId,
      manifesto,
      photo
    }

    this.refs.sock.socket.emit(NewPersonKey, data)

    this.LoadForm();
  }

  handlePositionsLoad(data){
    console.log("Got positions");

    var positionId = this.state.positionId ? this.state.positionId : data[0].id;

    this.setState({ 
      _positions: data,
      positionId
    });
  }

  isCandidate(){
    var filtered = this.state._positions.filter(p => p.id == this.state.positionId);

    if(filtered.length == 0)
      return false;

    var pos = filtered[0];
    return pos.type.indexOf("candidate") == 0;
  }

  render() {
    var candidateData = <p></p>;
    if(this.isCandidate()){
      candidateData = (
        <div>
          <Input type="text" label="First Manifesto Point" labelClassName="col-xs-2" wrapperClassName="col-xs-10" placeholder="First manifesto point" 
            onChange={this.handleFirstManifestoPointChange.bind(this)} value={this.state.manifesto.one} />
          <Input type="text" label="Second Manifesto Point" labelClassName="col-xs-2" wrapperClassName="col-xs-10" placeholder="Second manifesto point" 
            onChange={this.handleSecondManifestoPointChange.bind(this)} value={this.state.manifesto.two} />
          <Input type="text" label="Third Manifesto Point" labelClassName="col-xs-2" wrapperClassName="col-xs-10" placeholder="Third manifesto point" 
            onChange={this.handleThirdManifestoPointChange.bind(this)} value={this.state.manifesto.three} />

          <Input type="file" label="Photo" labelClassName="col-xs-2" wrapperClassName="col-xs-10" ref="fileUpload"
            onChange={this.handlePhotoChange.bind(this)} accept="image/png" />
          <Input label=" " labelClassName="col-xs-2" wrapperClassName="col-xs-10">
            <img src={this.state.photo} width="200px" height="200px" />
          </Input>

          <Input type="text" label="Elected" labelClassName="col-xs-2" wrapperClassName="col-xs-10" disabled value={this.state.elected?"yes":"no"} />
        </div>
      );
    }

    var positions = this.state._positions.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>);

    return (
      <div>
        <Socket.Event name={ GetPositionsKey } callback={ this.handlePositionsLoad.bind(this) } ref="sock"/>

        <form className="form-horizontal" onSubmit={this.handleSubmit.bind(this)}>
          <fieldset>
            <legend>Edit person</legend>

            <Input type="text" label="ID" labelClassName="col-xs-2" wrapperClassName="col-xs-10" disabled value={this.state.id} />
            <Input type="text" label="First Name" labelClassName="col-xs-2" wrapperClassName="col-xs-10" 
              onChange={this.handleFirstNameChange.bind(this)} value={this.state.firstName} />
            <Input type="text" label="Last Name" labelClassName="col-xs-2" wrapperClassName="col-xs-10" 
              onChange={this.handleLastNameChange.bind(this)} value={this.state.lastName} />
            <Input type="text" label="UID" labelClassName="col-xs-2" wrapperClassName="col-xs-10" placeholder="Enter a unique identifer - e.g. ado-ben"  
              onChange={this.handleUidChange.bind(this)} value={this.state.uid} />

            <Input type="select" label="Position" labelClassName="col-xs-2" wrapperClassName="col-xs-10" placeholder="Choose a position:" 
              onChange={this.handlePositionChange.bind(this)} value={this.state.positionId}>
              { positions }
            </Input>

            { candidateData }
           
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
