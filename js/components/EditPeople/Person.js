/*
* External Dependancies
*/

import React from 'react';
import ReactDOM from 'react-dom';
import Socket from 'react-socket';
import update from 'react-addons-update'

import {
  Form, FormGroup, FormControl, ControlLabel, 
  Col, 
  Button
} from 'react-bootstrap';

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
      },
      order: 9
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
        },
        order: 9
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

  handleOrderChange(e) {
    this.setState({ order: parseInt(e.target.value) });
  }

  handlePhotoChange(){
    const files = ReactDOM.findDOMNode(this.fileUpload).files;

    var reader = new FileReader();
    reader.onload = function(dat) {
      this.setState({ photo: dat.target.result });
    }.bind(this);
    reader.readAsDataURL( files[0] );
  }

  handleSubmit(e) {
    console.log(this.state);

    e.preventDefault();

    let {firstName, lastName, uid, id, positionId, manifesto, photo, order} = this.state;

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
      photo,
      order
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
          <FormGroup>
            <Col componentClass={ControlLabel} xs={2}>
              First Manifesto Point
            </Col>
            <Col xs={10}>
              <FormControl type="text" onChange={this.handleFirstManifestoPointChange.bind(this)} 
                placeholder="First manifesto point" value={this.state.manifesto.one} />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} xs={2}>
              Second Manifesto Point
            </Col>
            <Col xs={10}>
              <FormControl type="text" onChange={this.handleSecondManifestoPointChange.bind(this)} 
                placeholder="Second manifesto point" value={this.state.manifesto.two} />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} xs={2}>
              Third Manifesto Point
            </Col>
            <Col xs={10}>
              <FormControl type="text" onChange={this.handleThirdManifestoPointChange.bind(this)} 
                placeholder="Third manifesto point" value={this.state.manifesto.three} />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col componentClass={ControlLabel} xs={2}>
              Photo
            </Col>
            <Col xs={10}>
              <FormControl type="file" onChange={this.handlePhotoChange.bind(this)} ref={e => this.fileUpload = e} accept="image/png"  />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} xs={2}></Col>
            <Col xs={10}>
              <img src={this.state.photo} width="200px" height="200px" />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col componentClass={ControlLabel} xs={2}>
              Elected
            </Col>
            <Col xs={10}>
              <FormControl.Static>{ this.state.elected ? "yes" : "no" }</FormControl.Static>
            </Col>
          </FormGroup>
        </div>
      );
    }

    var positions = this.state._positions.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>);

    return (
      <div>
        <Socket.Listener event={ GetPositionsKey } callback={ this.handlePositionsLoad.bind(this) } ref="sock"/>

        <Form horizontal onSubmit={this.handleSubmit.bind(this)}>
          <fieldset>
            <legend>Edit person</legend>

            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                ID
              </Col>
              <Col xs={10}>
                <FormControl.Static>{ this.state.id }</FormControl.Static>
              </Col>
            </FormGroup>

            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                First Name
              </Col>
              <Col xs={10}>
                <FormControl type="text" onChange={this.handleFirstNameChange.bind(this)} value={this.state.firstName} />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                Last Name
              </Col>
              <Col xs={10}>
                <FormControl type="text" onChange={this.handleLastNameChange.bind(this)} value={this.state.lastName} />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                UID
              </Col>
              <Col xs={10}>
                <FormControl type="text" onChange={this.handleUidChange.bind(this)} placeholder="Enter a unique identifer - e.g. ado-ben" value={this.state.uid} />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                Position
              </Col>
              <Col xs={10}>
                <FormControl componentClass="select" onChange={this.handlePositionChange.bind(this)} value={this.state.positionId}>
                  { positions }
                </FormControl>
              </Col>
            </FormGroup>

            { candidateData }

            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                Order
              </Col>
              <Col xs={10}>
                <FormControl type="number" min="0" onChange={this.handleOrderChange.bind(this)} value={this.state.order} />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}></Col>
              <Col xs={10}>
                <Button type="submit" bsStyle="primary">Save</Button>&nbsp;
                <Button bsStyle="warning" onClick={() => this.LoadForm()}>Clear</Button>
              </Col>
            </FormGroup>
          </fieldset>
        </Form>
      </div>
    );
  }
}
