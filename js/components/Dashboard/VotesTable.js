/*
* External Dependancies
*/

import React from 'react';
import Socket from 'react-socket';
import {
  Table, Button,
  Input
} from 'react-bootstrap';

/*
* Variables
*/
const GetElectionsKey = "getElections";
const GetPositionKey = "getPositions";
const UpdatePositionKey = "updatePosition";
const SaveVoteKey = "saveVote";
const SaveEliminateKey = "saveEliminate";
const LoadResultsKey = "loadResults";


/*
* React
*/
export default class VotesTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      eliminated: [],
      labels: [],
      votes: []
    }
  }

  componentDidMount() {
    this.refs.sock.socket.emit(GetElectionsKey, { position: this.props.position })
  }

  componentWillReceiveProps(newProps){
    this.refs.sock.socket.emit(GetElectionsKey, { position: newProps.position })
  }

  loadedElectionData(data) {
    console.log("EL DATA", data);
    this.setState(data);
  }

  render() {
    var roundCols = this.state.eliminated.map((e, i) => <th>Round { i+1 }</th>);
    roundCols.push(<th>Round { this.state.eliminated.length+1 }</th>);

    var rows = this.state.labels.map(this.renderPerson.bind(this));

    return (
      <Table bordered>
        <Socket.Event name={ GetElectionsKey } callback={ this.loadedElectionData.bind(this) } ref="sock"/>
        <thead>
          <tr>
            <th>Name</th>
            { roundCols }
          </tr>
        </thead>
        <tbody>
          { rows }
        </tbody>
      </Table>
    );
  }

  renderPerson(label, index){
    var isEliminated = this.state.eliminated.indexOf(index) != -1;
    var roundData = [];
    var roundCols = this.state.eliminated.length;
    for(var r=0; r <= roundCols; r++){
      var v = "";
      if(this.state.votes[r] && this.state.votes[r][index])
        v = this.state.votes[r][index];

        roundData.push(<td>{ v }</td>);
    }

    return (
      <tr>
        <td>{ label }</td>
        { roundData }
      </tr>
    );
  }
}
