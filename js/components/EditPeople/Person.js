/*
* External Dependancies
*/

import React from 'react';
import ReactDOM from 'react-dom';
import { Event } from 'react-socket-io';

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
      photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAgMAAAAEE2bmAAAADFBMVEX////ExMSSkpJvb29L28/3AAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfhAwMVDg2+BocRAAADl0lEQVR42u2aPZLTQBBGLblYVaHAGVSR+AAEOoJ9BGJIyQg4gnSEvZF0BAccQAERkQMFNuXVsGvKrGxr/noeXkHNd4BXUs/XMz3dM5tFRUVFBeuNetKGQCX1kdWvw1Hpb9SjqmCWelYoaj5gNYGsesDqw1BLNdQ2iLU6Yx1CUJk6V4jJvl6w9owhQm2RXbE2UOTDol9fsXruF+U/uRxhdVi4xAFL1JjWWLikAVuMsloRqxhl7ZgEkqdRomFJgj/XsBos9DK3rjQsSfBLDevALaNoIUFWpmU12DJKTkmSVWhZO8xeElOQLKUwU8wNrApkNS/Iyg2sFrMqy9q+IGtpYHVYOvon5MrA8k2i2sB64NLRuzg0sVRkRVZkRVZk/TesGjw7SvBMK8GzlqwByNpkqvUXySJr36nW9yl4hyHvVpO9P5J35Kn2Achex1T7Odpd+kHAKsBe2hJbRrb3SPZEyV4t2kNeYKHXZVEjYpGzAHJGgc5OMixcM3TWhM7AyNkcOTNEZ5nkjJWc/V7kd9hMmpyVozP8wYeFftbgzUNfBbNObzGkG9e57o6o+1lUVFRUVFRUVNQ/qE+PleEPoiy8+1P8fg9FDW9Egc+H75AL8lE5d0/Loa7Jk0qgf2xo6AjjP97C3wfbIbAJk9/ivVyLfZbEF+Vt3iDtmUWULGVqnGX65fhKcYPR2syqoMj72sLyiz4fltQ21gb7RZ+fLK0sd4vZUc55lDmwdtQqeti1dmFVQC769fsWTqwDFy43VyRuKCfrZ46sDguX21ytdGQ5BMw1XC4BmzuztsB+4+6wlTNLMcnolpLuobcHLPdg7SCnugTfI/RWt9Y+rAbYB90qxMyL1WGht00tll4sxYXe4nw/lHEhU09Wi2xedud7ht645xeerJ44Nxwy0hdlOj+8WS22jKatdeHNOtyEVXizemaDtmS3gNVgltCzUgGrxeylN1gmYHWYvfS7joTVQzuh6SgqJaw1cqAZjS9B6cwKshIRq8VsrzO+jLUDWYfgEtrGEtlek5CFiNVTO7Q2IafKKmWsNZaOmoQUsjYgq50oaztR1lTjtQFzaP238zEH90Ly7Ei5ZWTrCbL+ImtMyUlUcXfRe9exsV17rjfUhY5gnmUdxL9FGgqn36yhr7LPC0/6QI2tlPrmPGx6HeKF6/cXphz0HXG/16MEbwLejZJ+Sh9kfLwEhbwgfvVlSPoc3/FERUVFRc1mvwDLWtceQXkzcAAAAABJRU5ErkJggg==',
      manifestoOne: "",
      manifestoTwo: "",
      manifestoThree: "",
      order: 9,
      elected: false,
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
        photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAgMAAAAEE2bmAAAADFBMVEX////ExMSSkpJvb29L28/3AAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfhAwMVDg2+BocRAAADl0lEQVR42u2aPZLTQBBGLblYVaHAGVSR+AAEOoJ9BGJIyQg4gnSEvZF0BAccQAERkQMFNuXVsGvKrGxr/noeXkHNd4BXUs/XMz3dM5tFRUVFBeuNetKGQCX1kdWvw1Hpb9SjqmCWelYoaj5gNYGsesDqw1BLNdQ2iLU6Yx1CUJk6V4jJvl6w9owhQm2RXbE2UOTDol9fsXruF+U/uRxhdVi4xAFL1JjWWLikAVuMsloRqxhl7ZgEkqdRomFJgj/XsBos9DK3rjQsSfBLDevALaNoIUFWpmU12DJKTkmSVWhZO8xeElOQLKUwU8wNrApkNS/Iyg2sFrMqy9q+IGtpYHVYOvon5MrA8k2i2sB64NLRuzg0sVRkRVZkRVZk/TesGjw7SvBMK8GzlqwByNpkqvUXySJr36nW9yl4hyHvVpO9P5J35Kn2Achex1T7Odpd+kHAKsBe2hJbRrb3SPZEyV4t2kNeYKHXZVEjYpGzAHJGgc5OMixcM3TWhM7AyNkcOTNEZ5nkjJWc/V7kd9hMmpyVozP8wYeFftbgzUNfBbNObzGkG9e57o6o+1lUVFRUVFRUVNQ/qE+PleEPoiy8+1P8fg9FDW9Egc+H75AL8lE5d0/Loa7Jk0qgf2xo6AjjP97C3wfbIbAJk9/ivVyLfZbEF+Vt3iDtmUWULGVqnGX65fhKcYPR2syqoMj72sLyiz4fltQ21gb7RZ+fLK0sd4vZUc55lDmwdtQqeti1dmFVQC769fsWTqwDFy43VyRuKCfrZ46sDguX21ytdGQ5BMw1XC4BmzuztsB+4+6wlTNLMcnolpLuobcHLPdg7SCnugTfI/RWt9Y+rAbYB90qxMyL1WGht00tll4sxYXe4nw/lHEhU09Wi2xedud7ht645xeerJ44Nxwy0hdlOj+8WS22jKatdeHNOtyEVXizemaDtmS3gNVgltCzUgGrxeylN1gmYHWYvfS7joTVQzuh6SgqJaw1cqAZjS9B6cwKshIRq8VsrzO+jLUDWYfgEtrGEtlek5CFiNVTO7Q2IafKKmWsNZaOmoQUsjYgq50oaztR1lTjtQFzaP238zEH90Ly7Ei5ZWTrCbL+ImtMyUlUcXfRe9exsV17rjfUhY5gnmUdxL9FGgqn36yhr7LPC0/6QI2tlPrmPGx6HeKF6/cXphz0HXG/16MEbwLejZJ+Sh9kfLwEhbwgfvVlSPoc3/FERUVFRc1mvwDLWtceQXkzcAAAAABJRU5ErkJggg==',
        manifestoOne: "",
        manifestoTwo: "",
        manifestoThree: "",
        order: 9,
        elected: false,
      });
    } else {
      this.setState(data);
    }
  }

  componentDidMount() {
    this.context.socket.emit(GetPositionsKey);
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

    let {firstName, lastName, uid, id, positionId, manifestoOne, manifestoTwo, manifestoThree, photo, order, elected} = this.state;

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
      order,
      elected
    };

    this.context.socket.emit(NewPersonKey, data);

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
        <Event event={ GetPositionsKey } handler={ e => this.handlePositionsLoad(e) } />

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

Person.contextTypes = {
  socket: React.PropTypes.object.isRequired
};
