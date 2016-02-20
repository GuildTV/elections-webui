/*
* External Dependancies
*/

import React from 'react';
import {
  Col,
  Input, Button,
  Popover, OverlayTrigger
} from 'react-bootstrap';

/*
* Variables
*/
const RunTemplateKey = "runTemplate";
const SetWinnerKey = "setWinner";
const ClearWinnerKey = "clearWinner";

/*
* React
*/

const overlayCss = {
  marginTop: "72px",
  textAlign: "center"
}

export default class PersonEntry extends React.Component {
  runTemplate(e){
    console.log("Running template:", e.target.getAttribute('data-id'));

    this.props.refs.sock.socket.emit(RunTemplateKey, {
      template: e.target.getAttribute('data-id'),
      data: this.props.data
    });
  }

  setWinner(e){
    console.log("Setting winner:", this.props.data.id);

    this.props.refs.sock.socket.emit(SetWinnerKey, this.props.data);

    //TODO - update client
  }

  cleareWinner(e){
    console.log("Clearing winner:", this.props.data.id);

    this.props.refs.sock.socket.emit(ClearWinnerKey, this.props.data);

    //TODO - update client
  }

  render() {
    var overlayContent = (
      <Popover title="More Templates" style={overlayCss}>
        <Button data-id="SidebarPhoto" onClick={this.runTemplate.bind(this)}>Sidebar - Photo</Button>
        <Button data-id="sidebarText" onClick={this.runTemplate.bind(this)}>Sidebar - Text</Button>
        {
          this.props.data.elect ? 
            <Button onClick={this.clearWinner.bind(this)}>Clear Winner</Button> : 
            <Button onClick={this.setWinner.bind(this)}>Mark Winner</Button>
        }
      </Popover>
    );

    return (
      <Col md={4} sm={6} xs={12} style={{ textAlign: "center" }}>
        <p>{ this.props.data.firstName } { this.props.data.lastName }</p>
        <p>
          <Button data-id="lowerThird" onClick={this.runTemplate.bind(this)}>Lower Third</Button>&nbsp;
          { 
            this.props.data.candidate ?
            <OverlayTrigger container={this.props.parent} trigger="click" placement="right" overlay={ overlayContent }>
              <Button bsStyle="info">More</Button>
            </OverlayTrigger> :
            ""
          }
        </p>
      </Col>
    );
  }
}