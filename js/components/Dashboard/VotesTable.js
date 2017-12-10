/*
* External Dependancies
*/

import React from 'react';
import { Event } from 'react-socket-io';
import $ from 'jquery';
import {
  Table, Button
} from 'react-bootstrap';

/*
* Variables
*/
const GetElectionsKey = "getElections";
const ShowResultsKey = "showResults";


/*
* React
*/
export default class VotesTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      error: null
    };
  }

  componentDidMount() {
    this.context.socket.emit(GetElectionsKey, { position: this.props.position });

    // refresh every few seconds
    console.log("Starting votes table refresher");
    setInterval(() => {
      this.context.socket.emit(GetElectionsKey, { position: this.props.position });
    }, 2000);
  }

  componentWillReceiveProps(newProps){
    this.context.socket.emit(GetElectionsKey, { position: newProps.position });
  }

  showRound(roundNum){
    const data = {
      id: this.props.position,
      round: roundNum
    };

    this.context.socket.emit(ShowResultsKey, data);
  }

  loadedElectionData(str) {
    // console.log("EL DATA", str);
    let xml = "";

    try {
      xml = $($.parseXML(str));
    } catch (e) {
      return this.setState({
        data: null,
        error: str
      });
    }

    const rows = {};
    $.each(xml.find("candidates candidate"), (i, v) => {
      window.v = v;
      rows[v.getAttribute('id')] = {
        name: v.innerHTML,
        results: []
      };
    });

    $.each(xml.find("rounds round"), (i, v) => {
      const number = parseInt(v.getAttribute('number'));
      $.each($(v).find("result"), (o, r) => {
        const cid = r.getAttribute('candidate');
        const elim = !!r.getAttribute('eliminated');
        const val = r.getAttribute('votes');

        if (!elim)
          rows[cid].results[number] = val;
      });
    });

    // console.log(rows)

    this.setState({
      data: rows,
      error: null
    });
  }

  renderInner() {
    const { data, error } = this.state;

    if (error)
      return <p>Error: { error }</p>;

    const roundCount = Math.max.apply(null, $.makeArray($.map(data, r => r.results.length)));

    const roundCols = [];
    for (let i=0; i<roundCount; i++){
      roundCols.push(<td key={i}>Round { i+1 }</td>);
    }

    const rows = Object.keys(data).map(v => this.renderPerson(data[v], roundCount));

    const sendRow = roundCols.map((v,i) => this.showButton(i));

    return (
      <Table bordered>
        <thead>
          <tr>
            <th>Name</th>
            { roundCols }
          </tr>
        </thead>
        <tbody>
          { rows }
          <tr>
            { this.showButton() }
            { sendRow }
          </tr>
        </tbody>
      </Table>
    );
  }

  render() {
    return (
      <div>
        <Event event={ GetElectionsKey } handler={e => this.loadedElectionData(e)} />
        { this.renderInner() }
      </div>
    );
  }

  showButton(roundNum){
    return (
      <td key={roundNum}>
        <Button bsStyle="success" onClick={() => this.showRound(roundNum)}>
          Show { roundNum >= 0 ? "" : "Latest" }
        </Button>
      </td>
    );
  }

  renderPerson(data, target){
    const label = data.name;

    const vals = data.results.map((r, i) => <td key={i}>{r}</td>);
    while (vals.length < target){
      vals.push(<td key={vals.length}></td>);
    }

    return (
      <tr key={data.name}>
        <td>{ label }</td>
        { vals }
      </tr>
    );
  }
}

VotesTable.contextTypes = {
  socket: React.PropTypes.object.isRequired
};
