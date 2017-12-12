import React from 'react';
import axios from 'axios';

import {
  Grid, Row, Col,
  Button
} from 'react-bootstrap';

const footerCss = {
  position: "fixed",
  bottom: 0,
  width: "100%",
  height: "200px",
  backgroundColor: "#464545",
  padding: "10px",
  borderTop: "5px solid #222222",
};

const goButtonCss = {
  width: "100%",
  height: "100%",
  fontSize: "4em"
};

export default class Footer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      state: {
        state: "clear",
        stateMessage: null,
        filename: "",
        instanceName: ""
      }
    };
  }

  SelectTemplateState(data){
    // console.log(data);
    try {
      if (data.state.state.toLowerCase() == "clear")
        return {
          state: "clear",
          stateMessage: null,
          filename: "",
          instanceName: ""
        };

      return data.state;
    } catch (e){
      return ((data || {}).state || {});
    }
  }

  KillButtonClick(){
    console.log("Sending KILL");

    axios.post('/api/cviz/kill')
    .then(() => {
      console.log("Kill template");
    })
    .catch(err => {
      alert("Kill template error:", err);
    });
  }

  GoButtonClick(){
    console.log("Sending GO");

    axios.post('/api/cviz/cue')
    .then(() => {
      console.log("Cue template");
    })
    .catch(err => {
      alert("Cue template error:", err);
    });
  }

  render() {
    const { instanceName, timelineFile, state, stateMessage } = this.SelectTemplateState(this.props.data);

    return (
      <footer style={footerCss}>
        <Grid style={{ height: "100%" }}>
          <Row style={{ height: "100%" }}>
            <Col xs={10}>
              <h3>Active: { instanceName }</h3>
              <h4>Template: { timelineFile}</h4>
              <h4>State: { state }{ stateMessage ? " - " + stateMessage : "" }</h4>
              <p><Button bsStyle="danger" onClick={() => this.KillButtonClick()}>Kill</Button></p>
            </Col>
            <Col xs={2} style={{ height: "100%" }}>
              <Button bsStyle="success" style={goButtonCss} onClick={() => this.GoButtonClick()}>Go</Button>
            </Col>
          </Row>
        </Grid>
      </footer>
    );
  }
}
