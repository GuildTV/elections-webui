import React from 'react';
import $ from 'jquery';
import axios from 'axios';
import {
  Table, Button
} from 'react-bootstrap';

export default class VotesTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      error: null
    };
  }

  componentDidMount() {
    this.updateData(this.props);

    // refresh every few seconds
    console.log("Starting votes table refresher");
    this.interval = setInterval(() => {
      this.updateData(this.props);
    }, 2000);
  }
  componentWillUnmount() {
    if (this.interval){
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  updateData(props){
    if (!props.position || props.position == "")
      return;

    axios.get('/api/results/position/'+props.position)
    .then(res => {
      this.loadedElectionData(res.data);
      console.log("Loaded graph data");
    })
    .catch(err => {
      console.error("Get graph data:", err);
    });
  }

  componentWillReceiveProps(newProps){
    this.updateData(newProps);
  }

  showRound(roundNum){
    if (!this.props.position || this.props.position == "")
      return;
    
    const data = {
      id: this.props.position,
      round: roundNum
    };

    axios.post('/api/results/current', data)
    .then(() => {
      console.log("Set current graph info");
    })
    .catch(err => {
      console.error("Get current graph info:", err);
    });

    this.props.roleChanged();
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

    this.setState({
      data: rows,
      error: null
    });
  }

  renderInner() {
    const { data, error } = this.state;
    const { graphId } = this.props;

    if (error)
      return <p>Error: { error }</p>;

    const roundCount = Math.max.apply(null, $.makeArray($.map(data, r => r.results.length)));

    const roundCols = [];
    for (let i=0; i<roundCount; i++){
      const className = graphId.round == i ? "currentRound" : "";
      roundCols.push(<td key={i} className={className}>Round { i+1 }</td>);
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