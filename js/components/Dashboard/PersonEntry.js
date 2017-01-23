/*
* External Dependancies
*/

import React from 'react';
import {
  Col,
  Button,
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
  marginTop: "65px",
  textAlign: "center"
};

export default class PersonEntry extends React.Component {
  runTemplate(e){
    console.log("Running template:", e.target.getAttribute('data-id'));

    this.props.sock.socket.emit(RunTemplateKey, {
      template: e.target.getAttribute('data-id'),
      data: { candidate: this.props.data },
      dataId: this.props.data.uid
    });
  }

  setWinner(){
    console.log("Setting winner:", this.props.data.id);

    this.props.sock.socket.emit(SetWinnerKey, this.props.data);
  }

  clearWinner(){
    console.log("Clearing winner:", this.props.data.id);

    this.props.sock.socket.emit(ClearWinnerKey, this.props.data);
  }

  closePopover(){

    return false;
  }

  render() {
    const hasManifestoPoints = this.props.data.manifestoOne.length > 2 || this.props.data.manifestoTwo.length > 2 || this.props.data.manifestoThree.length > 2;

    const overlayContent = (
      <Popover id="" title="More Templates" style={overlayCss}>
        {
          hasManifestoPoints ?
            <span>
              <Button data-id="SidebarPhoto" onClick={(e) => this.runTemplate(e)}>Sidebar - Photo</Button>
              <Button data-id="sidebarText" onClick={(e) => this.runTemplate(e)}>Sidebar - Text</Button>
            </span> :
            ""
        }
        {
          this.props.data.elected ?
            <Button onClick={() => this.clearWinner()}>Clear Winner</Button> :
            <Button onClick={() => this.setWinner()}>Mark Winner</Button>
        }
      </Popover>
    );

    const isValid = this.props.data.Position && this.props.data.Position.type;
    const isCandidate = isValid && this.props.data.Position.type.indexOf('candidate') == 0;

    if(!isValid)
      return (<p></p>);

    return (
      <Col md={4} sm={6} xs={12} style={{ textAlign: "center" }}>
        <p>{ this.props.data.firstName } { this.props.data.lastName } - { this.props.data.Position.miniName }</p>
        <p>
          <Button data-id="lowerThird" onClick={(e) => this.runTemplate(e)}>Lower Third</Button>&nbsp;
          {
            isCandidate ?
            <OverlayTrigger key={Date.now()} container={this.props.parent} trigger="click" placement="right" rootClose overlay={ overlayContent }>
              <Button bsStyle="info">More</Button>
            </OverlayTrigger> :
            ""
          }
        </p>
      </Col>
    );
  }
}
