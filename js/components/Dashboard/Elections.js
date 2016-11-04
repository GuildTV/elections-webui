/*
* External Dependancies
*/

import React from 'react';
import Socket from 'react-socket';
import {
  Table, Button, Grid, Row, Col,
  Input 
} from 'react-bootstrap';

import VotesTable from './VotesTable';
/*
* Variables
*/
const GetPositionKey = "getPositions";
const UpdatePositionKey = "updatePosition";
const LoadResultsKey = "loadResults";

/*
* React
*/
export default class Elections extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownRole: "",
      currentRole: "",
      positions: []
    }
  }

  loadedPositionData(positions) {
    var dropdownRole = positions[0].id;
    this.setState({
      positions,
      dropdownRole
    });
  }

  handlePositionUpdate(newData) {
    let isNew = true;
    let positions = this.state.positions.map((pos) => {
      if (pos.id === newData.id) {
        isNew = false;
        return newData;
      } else {
        return pos;
      }
    });

    if(isNew) {
      positions.push(newData);
    }

    this.setState({ positions });
  }

  handlePositionSelectionChange(e){
    this.setState({dropdownRole: e.target.value});
  }

  loadPositionData(e){
    var currentRole = this.state.dropdownRole;
    this.setState({ currentRole });
    console.log("LOAD", LoadResultsKey, currentRole)
    this.refs.sock.socket.emit(LoadResultsKey, { role: currentRole });
  }

  render() {
    var positions = this.state.positions.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>);

    return (
      <div>
        <Socket.Event name={ GetPositionKey } callback={ this.loadedPositionData.bind(this) } ref="sock"/>
        <Socket.Event name={ UpdatePositionKey } callback={ this.handlePositionUpdate.bind(this) } />

        <form className="form-horizontal" onsubmit="return false">
          <fieldset>
            <Input label="Live Mode" labelClassName="col-xs-2" wrapperClassName="col-xs-10">
              TODO
            </Input>
            <Input label="Current position:" labelClassName="col-xs-2" wrapperClassName="col-xs-10">
              <Row>
                <Col xs={10}>
                  <Input type="select" onChange={this.handlePositionSelectionChange.bind(this)} value={this.state.dropdownRole}>
                    { positions }
                  </Input>
                </Col>
                <Col xs={2}>
                  <Button bsStyle="success" onClick={this.loadPositionData.bind(this)} >Preview</Button>
                </Col>
              </Row>
            </Input>
          </fieldset>
        </form>

        <VotesTable position={this.state.currentRole} />
      </div>
    );
  }
}
