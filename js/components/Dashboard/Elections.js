import React from 'react';
import axios from 'axios';
import {
  Col,
  Form, FormGroup, FormControl, ControlLabel, Button
} from 'react-bootstrap';

import VotesTable from './VotesTable';

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
    };
  }

  componentDidMount() {
    this.updateData();
  }

  updateData(){
    axios.get('/api/results/current')
    .then(res => {
      this.setState({ graphId: res.data || {} });
      console.log("Loaded current graph info");
    })
    .catch(err => {
      this.setState({ graphId: {
        id: null,
        round: null,
      } });
      alert("Get current graph info error:", err);
    });

    axios.get('/api/results/positions')
    .then(res => {
      this.setState({ 
        positions: res.data || [],
        dropdownRole: res.data[0].id,
      });
      console.log("Loaded graph positions");
    })
    .catch(err => {
      this.setState({ positions: []});
      alert("Get graph positions error:", err);
    }); 
  }

  handlePositionSelectionChange(e){
    this.setState({dropdownRole: e.target.value});
  }

  loadPositionData(){
    const currentRole = this.state.dropdownRole;
    this.setState({ currentRole });
  }

  clearGraphId(){
    const data = {
      id: null,
      name: null,
      round: null
    };

    axios.post('/api/results/current', data)
    .then(() => {
      this.setState({ graphId: data });
      console.log("Set current graph info");
    })
    .catch(err => {
      this.setState({ graphId: {}});
      alert("Set current graph info error:", err);
    });
  }

  getGraphId(){
    const { graphId, positions } = this.state;
    if (!graphId || !graphId.id)
      return "Sabb Graph Proxy";

    let name = graphId.id;
    const position = positions.find(p => p.id == graphId.id);
    if (position)
      name = position.name;

    if (graphId.round >= 0)
      return name + " - Round " + (graphId.round+1);

    return name;
  }

  render() {
    const positions = this.state.positions.map((p) => {
      const name = p.id == this.state.graphId.id ? " - " + p.name + " - " : p.name;
      return <option key={p.id} value={p.id}>{name}</option>;
    });

    return (
      <div>

        <Form horizontal>
          <fieldset>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                Current Graph:
              </Col>
              <Col xs={8}>
                <FormControl.Static>{ this.getGraphId() }</FormControl.Static>
              </Col>
              <Col xs={2}>
                <Button bsStyle="danger" onClick={() => this.clearGraphId()}>Clear</Button>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                Current position:
              </Col>
              <Col xs={8}>
                <FormControl componentClass="select" onChange={e => this.handlePositionSelectionChange(e)} value={this.state.dropdownRole}>
                  { positions }
                </FormControl>
              </Col>
              <Col xs={2}>
                <Button bsStyle="success" onClick={() => this.loadPositionData()} >Preview</Button>
              </Col>
            </FormGroup>
        </fieldset>
        </Form>

        <VotesTable position={this.state.currentRole} graphId={this.state.graphId} roleChanged={() => this.updateData()}/>
      </div>
    );
  }
}
