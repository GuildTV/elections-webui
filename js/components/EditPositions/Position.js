/*
* External Dependancies
*/

import React from 'react';
import Socket from 'react-socket';
import Switch from 'react-bootstrap-switch';

import {
  Form, FormGroup, FormControl, ControlLabel, 
  Col, 
  Button
} from 'react-bootstrap';

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
      sabbGraphId: '',
      type: 'candidateSabb',
      fullName: '',
      compactName: '',
      miniName: '',
      order: 9,
      winnerOrder:9,
      sidebarUseOfficer: true
    };
  }

  LoadForm(data){
    console.log(data);
    if(data === null || data === undefined){
      this.setState({
        id: undefined,
        sabbGraphId: '',
        type: 'candidateSabb',
        fullName: '',
        compactName: '',
        miniName: '',
        order: 9,
        winnerOrder: 9,
        sidebarUseOfficer: true
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
  handleSabbGraphIdChange(e) {
    this.setState({sabbGraphId: e.target.value});
  }

  handleTypeChange(e) {
    this.setState({type: e.target.value});
  }

  handleOrderChange(e) {
    this.setState({ order: parseInt(e.target.value) });
  }
  handleWinnerOrderChange(e) {
    this.setState({ winnerOrder: parseInt(e.target.value) });
  }
  handleShowOfficerSidebarChange(s) {
    this.setState({ sidebarUseOfficer: s.value() });
  }

  handleSubmit(e) {
    console.log(this.state);

    e.preventDefault();

    let {fullName, compactName, miniName, type, order, winnerOrder} = this.state;

    if (!fullName || !compactName || !miniName || !type || !order || !winnerOrder) {
      //todo error handling
      alert("Missing input data");
      return;
    }

    this.sock.socket.emit(SavePositionKey, this.state);

    this.LoadForm();
  }

  render() {
    return (
      <div>
        <Socket.Listener event={ SavePositionKey } callback={()=>{}} ref={e => this.sock = e} />

        <Form horizontal onSubmit={e => this.handleSubmit(e)}>
          <fieldset>
            <legend>Edit position</legend>

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
                Type
              </Col>
              <Col xs={10}>
                <FormControl componentClass="select" onChange={e => this.handleTypeChange(e)} value={this.state.type}>
                  <option value="candidateSabb">Candidate - Sabb</option>
                  <option value="candidateNonSabb">Candidate - Non Sabb</option>
                  <option value="other">Other</option>  
                </FormControl>
              </Col>
            </FormGroup>

            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                Sabb Graph Id
              </Col>
              <Col xs={10}>
                <FormControl type="text" onChange={e => this.handleSabbGraphIdChange(e)} value={this.state.sabbGraphId} />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                Full Name
              </Col>
              <Col xs={10}>
                <FormControl type="text" onChange={e => this.handleFullNameChange(e)} value={this.state.fullName} />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                Compact Name
              </Col>
              <Col xs={10}>
                <FormControl type="text" onChange={e => this.handleCompactNameChange(e)} value={this.state.compactName} />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                Mini Name
              </Col>
              <Col xs={10}>
                <FormControl type="text" onChange={e => this.handleMiniNameChange(e)} value={this.state.miniName} />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                Board Order
              </Col>
              <Col xs={10}>
                <FormControl type="number" min="0" onChange={e => this.handleOrderChange(e)} value={this.state.order} />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                Winner Order
              </Col>
              <Col xs={10}>
                <FormControl type="number" min="0" onChange={e => this.handleWinnerOrderChange(e)} value={this.state.winnerOrder} />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                Show 'officer' in sidebar
              </Col>
              <Col xs={10}>
                <Switch onChange={e => this.handleShowOfficerSidebarChange(e)} value={this.state.sidebarUseOfficer} />
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
