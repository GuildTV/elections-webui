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

/*
* React
*/
export default class Elections extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentRole: "",
      positions: []
    }
  }

  loadedPositionData(positions) {
    var currentRole = positions[0].id;
    this.setState({
      positions,
      currentRole
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
    this.setState({currentRole: e.target.value});
  }

  render() {
    var positions = this.state.positions.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>);

    return (
      <div>
        <Socket.Event name={ GetPositionKey } callback={ this.loadedPositionData.bind(this) } ref="sock"/>
        <Socket.Event name={ UpdatePositionKey } callback={ this.handlePositionUpdate.bind(this) } />

        <form className="form-horizontal" onsubmit="return false">
          <fieldset>
            <Input type="select" label="Current position" labelClassName="col-xs-2" wrapperClassName="col-xs-10" 
              onChange={this.handlePositionSelectionChange.bind(this)} value={this.state.currentRole}>
              { positions }
            </Input>
          </fieldset>
        </form>

        <VotesTable position={this.state.currentRole} />
      </div>
    );
  }
}
