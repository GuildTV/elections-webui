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
const GetPositionKey = "getPositions";
const UpdatePositionKey = "updatePosition";

/*
* React
*/
export default class Boards extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      positions: []
    };
  }

  handelInitialData(positions) {
    this.setState({ positions });
  }

  handleStateChange(newData) {
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

    this.setState({positions});
  }

  componentDidMount() {
    this.sock.socket.emit(GetPositionKey);
  }

  runTemplate(e){
    console.log("Running template:", e.target.getAttribute('data-id'));

    this.sock.socket.emit(RunTemplateKey, {
      template: e.target.getAttribute('data-id'),
      data: e.target.getAttribute('data-data'),
      dataId: e.target.getAttribute('data-key')
    });
  }

  render() {
    const sabbs = this.state.positions
      .filter(p => p.type == "candidateSabb")
      .map(p => <Button key={p.id} data-id="candidateBoard" data-data={ p.id } data-key={ p.miniName } onClick={(e) => this.runTemplate(e)} className="btn-lg">{p.miniName}</Button>);
    const nonSabbs = this.state.positions
      .filter(p => p.type == "candidateNonSabb")
      .map(p => <Button key={p.id} data-id="candidateBoard" data-data={ p.id } data-key={ p.miniName } onClick={(e) => this.runTemplate(e)} className="btn-lg">{p.miniName}</Button>);

    return (
      <div>
        <Socket.Listener event={ GetPositionKey } callback={e => this.handelInitialData(e)} ref={e => this.sock = e} />
        <Socket.Listener event={ UpdatePositionKey } callback={e => this.handleStateChange(e)} />

        <h3>Winners</h3>
        <p>
          <Button data-id="winnersAll" data-key="winnersAll" onClick={(e) => this.runTemplate(e)} className="btn-lg">All</Button>
          <Button data-id="winnersSabbs" data-key="winnersSabbs" onClick={(e) => this.runTemplate(e)} className="btn-lg">Sabbs</Button>
          <Button data-id="winnersNonSabbs" data-key="winnersNonSabbs" onClick={(e) => this.runTemplate(e)} className="btn-lg">Non-Sabbs</Button>
        </p>

        <hr />
        <h3>Candidate Sequences</h3>
        <p>
          <Button data-id="candidateSabbs" data-key="candidateSabbs" onClick={(e) => this.runTemplate(e)} className="btn-lg">Sabbs</Button>
          <Button data-id="candidateNonSabbs" data-key="candidateNonSabbs" onClick={(e) => this.runTemplate(e)} className="btn-lg">Non-Sabbs</Button>
        </p>

        <hr />
        <h3>Candidate Individual</h3>
        <h4>Sabbs</h4>
        <p>
          { sabbs }
        </p>
        <h4>Non Sabbs</h4>
        <p>
          { nonSabbs }
        </p>
      </div>
    );
  }
}
