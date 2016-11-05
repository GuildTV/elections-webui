/*
* External Dependancies
*/
import React from 'react';
import Socket from 'react-socket';

import {
  Grid, Row, Col,
  Button
} from 'react-bootstrap';

/*
* Internal Dependancies
*/

/*
* Variables
*/
const ChangeTemplateStateKey = "templateState";
const GoTemplateKey = "templateGo";
const KillTemplateKey = "templateKill";

const footerCss = {
  position: "absolute",
  bottom: 0,
  width: "100%",
  height: "200px",
  backgroundColor: "#f5f5f5",
  padding: "10px"
};

const goButtonCss = {
  width: "100%",
  height: "100%",
  fontSize: "4em"
};

/*
* React
*/
export default class Footer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      state: "CLEAR",
      dataId: "",
      templateName: ""
    };
  }

  ChangeTemplateState(data){
    this.setState(data);
  }

  KillButtonClick(){
    console.log("Sending KILL");

    this.refs.sock.socket.emit(KillTemplateKey);
  }

  GoButtonClick(){
    console.log("Sending GO");

    this.refs.sock.socket.emit(GoTemplateKey);
  }

  render() {
    return (
      <footer style={footerCss}>
        <Socket.Listener event={ ChangeTemplateStateKey } callback={ this.ChangeTemplateState.bind(this) } ref="sock"/>

        <Grid style={{ height: "100%" }}>
          <Row style={{ height: "100%" }}>
            <Col xs={10}>
              <h3>Active: { this.state.dataId }</h3>
              <h4>Template: { this.state.templateName }</h4>
              <p><Button bsStyle="danger" ref="clearBtn" onClick={this.KillButtonClick.bind(this)}>Kill</Button></p>
            </Col>
            <Col xs={2} style={{ height: "100%" }}>
              <Button bsStyle="success" style={goButtonCss} ref="goBtn" onClick={this.GoButtonClick.bind(this)}>Go</Button>
            </Col>
          </Row>
        </Grid>
      </footer>
    );
  }
}
