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

  setPendingVote(e){
    var i = parseInt(e.target.getAttribute('data-id'));

    var votes = this.state.votes;
    var round = this.state.eliminated.length;
    if(!votes[round])
      votes[round] = [];
    votes[round][i] = parseInt(e.target.value);

    this.setState({ votes });
  }

  saveVote(e){
    var index = parseInt(e.target.getAttribute('data-id'));
    var round = this.state.eliminated.length;

    console.log("Saving vote", index);

    var count = this.state.votes[round][index];
    if(count == undefined || count == null)
      return;

    this.refs.sock.socket.emit(SaveVoteKey, {
      id: this.state.ids[index],
      round: this.state.eliminated.length,
      count: this.state.votes[round][index]
    });
  }

  saveEliminate(e){
    var index = parseInt(e.target.getAttribute('data-id'));
    var round = this.state.eliminated.length;

    console.log("Saving eliminate", index);

    if(this.state.eliminated.indexOf(index) > 0)
      return;

    this.refs.sock.socket.emit(SaveEliminateKey, {
      id: this.state.ids[index],
      round: this.state.eliminated.length
    });

    var eliminated = this.state.eliminated;
    eliminated.push(index);
    this.setState({ eliminated });
    console.log(eliminated);
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
            <th>Eliminate</th>
            <th>Name</th>
            { roundCols }
            <th></th>
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

      if(r == roundCols && !isEliminated)
        roundData.push(<td>
            <Input type="number" onChange={this.setPendingVote.bind(this)} data-id={index} ref={ "vote"+index } value={v} />
          </td>);
      else
        roundData.push(<td>{ v }</td>);
    }

    return (
      <tr>
        <td>{ isEliminated ?"":<Button bsStyle="danger" onClick={this.saveEliminate.bind(this)} data-id={index}>Eliminate</Button> }</td>
        <td>{ label }</td>
        { roundData }
        <td>{ isEliminated?"":<Button bsStyle="success" onClick={this.saveVote.bind(this)} data-id={index}>Save</Button> }</td>
      </tr>
    );
  }
}
