/*
* External Dependancies
*/

import React from 'react';
import ReactDOM from 'react-dom';
import Socket from 'react-socket';

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
      manifestoOne: "",
      manifestoTwo: "",
      manifestoThree: "",
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
        manifestoOne: "",
        manifestoTwo: "",
        manifestoThree: "",
        order: 9
      });
    } else {
      this.setState(data);
    }
  }

  componentDidMount() {
    this.sock.socket.emit(GetPositionsKey);
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
    this.setState({ manifestoOne: e.target.value });
  }

  handleSecondManifestoPointChange(e) {
    this.setState({ manifestoTwo: e.target.value });
  }

  handleThirdManifestoPointChange(e) {
    this.setState({ manifestoThree: e.target.value });
  }

  handleOrderChange(e) {
    this.setState({ order: parseInt(e.target.value) });
  }

  handlePhotoChange(){
    const files = ReactDOM.findDOMNode(this.fileUpload).files;

    const reader = new FileReader();
    reader.onload = function(dat) {
      this.setState({ photo: dat.target.result });
    }.bind(this);
    reader.readAsDataURL( files[0] );
  }

  handleSubmit(e) {
    console.log(this.state);

    e.preventDefault();

    let {firstName, lastName, uid, id, positionId, manifestoOne, manifestoTwo, manifestoThree, photo, order} = this.state;

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
      manifestoOne,
      manifestoTwo,
      manifestoThree,
      photo,
      order
    };

    this.sock.socket.emit(NewPersonKey, data);

    this.LoadForm();
  }

  handlePositionsLoad(data){
    console.log("Got positions");

    const positionId = this.state.positionId ? this.state.positionId : data[0].id;

    this.setState({
      _positions: data,
      positionId
    });
  }

  isCandidate(){
    const filtered = this.state._positions.filter(p => p.id == this.state.positionId);

    if(filtered.length == 0)
      return false;

    const pos = filtered[0];
    return pos.type.indexOf("candidate") == 0;
  }

  render() {
    let candidateData = <p></p>;
    if(this.isCandidate()){
      candidateData = (
        <div>
          <FormGroup>
            <Col componentClass={ControlLabel} xs={2}>
              First Manifesto Point
            </Col>
            <Col xs={10}>
              <FormControl type="text" onChange={e => this.handleFirstManifestoPointChange(e)} 
                placeholder="First manifesto point" value={this.state.manifestoOne} />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} xs={2}>
              Second Manifesto Point
            </Col>
            <Col xs={10}>
              <FormControl type="text" onChange={e => this.handleSecondManifestoPointChange(e)} 
                placeholder="Second manifesto point" value={this.state.manifestoTwo} />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} xs={2}>
              Third Manifesto Point
            </Col>
            <Col xs={10}>
              <FormControl type="text" onChange={e => this.handleThirdManifestoPointChange(e)} 
                placeholder="Third manifesto point" value={this.state.manifestoThree} />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col componentClass={ControlLabel} xs={2}>
              Photo
            </Col>
            <Col xs={10}>
              <FormControl type="file" onChange={e => this.handlePhotoChange(e)} ref={e => this.fileUpload = e} accept="image/png"  />
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

    const positions = this.state._positions.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>);

    return (
      <div>
        <Socket.Listener event={ GetPositionsKey } callback={ e => this.handlePositionsLoad(e) } ref={e => this.sock = e} />

        <Form horizontal onSubmit={e => this.handleSubmit(e)}>
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
                <FormControl type="text" onChange={e => this.handleFirstNameChange(e)} value={this.state.firstName} />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                Last Name
              </Col>
              <Col xs={10}>
                <FormControl type="text" onChange={e => this.handleLastNameChange(e)} value={this.state.lastName} />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                UID
              </Col>
              <Col xs={10}>
                <FormControl type="text" onChange={e => this.handleUidChange(e)} placeholder="Enter a unique identifer - e.g. ado-ben" value={this.state.uid} />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                Position
              </Col>
              <Col xs={10}>
                <FormControl componentClass="select" onChange={e => this.handlePositionChange(e)} value={this.state.positionId}>
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
                <FormControl type="number" min="0" onChange={e => this.handleOrderChange(e)} value={this.state.order} />
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
