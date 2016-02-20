/*
* External Dependancies
*/

import React from 'react';
import Socket from 'react-socket';
import {
  Button
} from 'react-bootstrap';

/*
* Variables
*/
const RunTemplateKey = "runTemplate";

/*
* React
*/
export default class Boards extends React.Component {
  runTemplate(e){
    console.log("Running template:", e.target.getAttribute('data-id'));

    this.refs.sock.socket.emit(RunTemplateKey, {
      template: e.target.getAttribute('data-id')
    });
  }

  render() {
    return (
      <div>
        <Socket.Event name="send" ref="sock" />

        <h3>Winners</h3>
        <p>
          <Button data-id="winnersAll" onClick={this.runTemplate.bind(this)} className="btn-lg">All</Button>
          <Button data-id="winnersSabbs" onClick={this.runTemplate.bind(this)} className="btn-lg">Sabbs</Button>
          <Button data-id="winnersNonSabbs" onClick={this.runTemplate.bind(this)} className="btn-lg">Non-Sabbs</Button>
        </p>

        <hr />
        <h3>Candidate Sequences</h3>
        <p>
          <Button data-id="candidateSabbs" onClick={this.runTemplate.bind(this)} className="btn-lg">Sabbs</Button>
          <Button data-id="candidateNonSabbs" onClick={this.runTemplate.bind(this)} className="btn-lg">Non-Sabbs</Button>
        </p>

        <hr />
        <h3>Candidate Individual</h3>

      </div>
    );
  }
}
