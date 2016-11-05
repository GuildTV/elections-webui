/*
* External Dependancies
*/

import React from 'react';
import Socket from 'react-socket';
import {
  Button, Row, Col, Input
} from 'react-bootstrap';

import VotesTable from './VotesTable';
/*
* Variables
*/
const GetPositionKey = "getPositions";
const UpdatePositionKey = "updatePosition";
const LoadResultsKey = "loadResults";
const CurrentGraphId = "currentGraphId";
const ShowResultsKey = "showResults";

/*
* React
*/
export default class Elections extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownRole: "",
      currentRole: "",
      positions: [],
      graphId: {
        id: null,
        round: null
      }
    }
  }

  componentDidMount() {
    this.refs.sock.socket.emit(CurrentGraphId);
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

  loadPositionData(){
    var currentRole = this.state.dropdownRole;
    this.setState({ currentRole });
    console.log("LOAD", LoadResultsKey, currentRole)
    this.refs.sock.socket.emit(LoadResultsKey, { role: currentRole });
  }

  handleGraphId(data){
    console.log("Graph ID:", data);
    this.setState({ graphId: data });
  }

  clearGraphId(){
    this.refs.sock.socket.emit(ShowResultsKey, {
      id: null,
      round: null
    });
  }

  getGraphId(){
    const { graphId, positions } = this.state;
    if (!graphId || !graphId.id)
      return "Sabb Graph Proxy";

    let name = graphId.id;
    const position = positions.find(p => p.id == graphId.id);
    if (position)
      name = position.fullName;

    if (graphId.round >= 0)
      return name + " - Round " + (graphId.round+1);

    return name;
  }

  render() {
    var positions = this.state.positions.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>);

    return (
      <div>
        <Socket.Event name={ GetPositionKey } callback={ this.loadedPositionData.bind(this) } ref="sock"/>
        <Socket.Event name={ UpdatePositionKey } callback={ this.handlePositionUpdate.bind(this) } />
        <Socket.Event name={ CurrentGraphId } callback={ this.handleGraphId.bind(this) } />

        <form className="form-horizontal" onSubmit="return false">
          <fieldset>
            <Input label="Current Graph" labelClassName="col-xs-2" wrapperClassName="col-xs-10">
              <Row>
                <Col xs={10}>
                  { this.getGraphId() }
                </Col>
                <Col xs={2}>
                  <Button bsStyle="danger" onClick={() => this.clearGraphId()}>Clear</Button>
                </Col>
              </Row>
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
