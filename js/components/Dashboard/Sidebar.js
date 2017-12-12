import React from 'react';
import axios from 'axios';
import {
  Grid, Row, Col,
  Button
} from 'react-bootstrap';

const sidebarCss = {
  backgroundColor: "#464545",
  padding: "10px",
  height: "calc(100vh - 60px - 200px)",
};

export default class Sidebar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  handleClear() {
    if (!confirm("Are you sure?"))
      return;

    axios.post('/api/cviz/adjustment/clear')
    .then(res => console.log("Cleared adjustments"))
    .catch(err => console.log("Clear error: err"));
  }

  render() {
    const entries = this.props.data.adjustments.map((a, i) => <SidebarEntry key={i} data={a} />)

    return (
      <div id="dashSidebar" style={sidebarCss}>
        <h3>Adjustments</h3>
        <p>
          <Button bsStyle="danger" onClick={() => this.handleClear()}>Remove all</Button>
        </p>

        <div className="entryList">
          <div>
            { entries }
          </div>
        </div>

      </div>
    );
  }
}


class SidebarEntry extends React.Component {
  handleRemove() {
    const id = this.props.data.id;

    axios.delete('/api/cviz/adjustment/'+id)
    .then(res => console.log("Removed:", id))
    .catch(err => console.log("Remove error: err"));
  }
  handleSetNext() {
    const id = this.props.data.id;

    axios.post('/api/cviz/adjustment/next/'+id)
    .then(res => console.log("Set next:", id))
    .catch(err => console.log("Set next error: err"));
  }

  render() {
    const { key } = this.props.data;

    return (
      <div className="sidebarEntry">
        <p>{ key }</p>
        <p>
          <Button bsStyle="success" onClick={() => this.handleSetNext()}>Set next</Button>
          <Button bsStyle="danger" onClick={() => this.handleRemove()}>Remove</Button>
        </p>
        <hr />
      </div>
    );
  }
}