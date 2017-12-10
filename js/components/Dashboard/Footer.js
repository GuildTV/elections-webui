/*
* External Dependancies
*/
import React from 'react';
import { Event } from 'react-socket-io';

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
  backgroundColor: "#464545",
  padding: "10px",
  borderTop: "5px solid #222222",
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
      state: {
        state: "CLEAR",
        stateMessage: null,
        filename: "",
        instanceName: ""
      }
    };
  }

  ChangeTemplateState(data){
    // if (data.id != this.props.id)
    //   return;
    
    if (data.state == "CLEAR"){
      this.setState({
        state: {
          state: "CLEAR",
          stateMessage: null,
          filename: "",
          instanceName: ""
        }
      });
    } else {
      this.setState({ state: data });
    }
  }

  KillButtonClick(){
    console.log("Sending KILL");

    this.context.socket.emit(KillTemplateKey);
  }

  GoButtonClick(){
    console.log("Sending GO");

    this.context.socket.emit(GoTemplateKey);
  }

  render() {
    const { instanceName, timelineFile, state, stateMessage } = this.state.state;

    return (
      <footer style={footerCss}>
        <Event event={ ChangeTemplateStateKey } handler={d => this.ChangeTemplateState(d)} />

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

Footer.contextTypes = {
  socket: React.PropTypes.object.isRequired
};
