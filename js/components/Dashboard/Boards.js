import React from 'react';
import axios from 'axios';
import {
  Button
} from 'react-bootstrap';

export default class Boards extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      positions: []
    };
  }

  componentDidMount() {
    this.updateData();
  }
  componentWillUnmount(){
    this.setState({
      positions: [],
    });
  }
  updateData(){
    axios.get('/api/positions')
    .then(res => {
      this.setState({ positions: res.data || [] });
      console.log("Loaded " + res.data.length + " positions");
    })
    .catch(err => {
      this.setState({ positions: [] });
      alert("Get positions error:", err);
    });
  }

  runTemplate(e){
    console.log("Running template:", e.target.getAttribute('data-id'));

    axios.post('/api/run/board/'+e.target.getAttribute('data-id')+'/'+e.target.getAttribute('data-key'))
    .then(() => {
      console.log("Run template");
    })
    .catch(err => {
      alert("Run template error:", err);
    });
  }

  render() {
    const sabbs = this.state.positions
      .filter(p => p.type == "candidateSabb")
      .map(p => <Button key={p.id} data-id="candidateBoard" data-key={ p.id } onClick={(e) => this.runTemplate(e)} className="btn-lg">{p.miniName}</Button>);
    const nonSabbs = this.state.positions
      .filter(p => p.type == "candidateNonSabb")
      .map(p => <Button key={p.id} data-id="candidateBoard" data-key={ p.id } onClick={(e) => this.runTemplate(e)} className="btn-lg">{p.miniName}</Button>);

    return (
      <div>
        <h3>Winner Boards</h3>
        <p>
          <Button data-id="winnersAll" data-key="winnersAll" onClick={(e) => this.runTemplate(e)} className="btn-lg">All</Button>
          <Button data-id="winnersSabbs" data-key="winnersSabbs" onClick={(e) => this.runTemplate(e)} className="btn-lg">Sabbs</Button>
          <Button data-id="winnersNonSabbs" data-key="winnersNonSabbs" onClick={(e) => this.runTemplate(e)} className="btn-lg">Non-Sabbs</Button>
        </p>

        <hr />
        <h3>Candidate Sequences</h3>
        <p>
          <Button data-id="candidateAll" data-key="candidateAll" onClick={(e) => this.runTemplate(e)} className="btn-lg">All</Button>
          <Button data-id="candidateSabbs" data-key="candidateSabbs" onClick={(e) => this.runTemplate(e)} className="btn-lg">Sabbs</Button>
          <Button data-id="candidateNonSabbs" data-key="candidateNonSabbs" onClick={(e) => this.runTemplate(e)} className="btn-lg">Non-Sabbs</Button>
        </p>

        <hr />
        <h3>Individual Role</h3>
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

Boards.contextTypes = {
  socket: React.PropTypes.object.isRequired
};
