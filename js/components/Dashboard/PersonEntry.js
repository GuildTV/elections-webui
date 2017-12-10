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
  // marginTop: "65px",
  textAlign: "center"
};

export default class PersonEntry extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      top: "0px",
    };
  }

  runTemplate(e){
    console.log("Running template:", e.target.getAttribute('data-id'));

    this.context.socket.emit(RunTemplateKey, {
      template: e.target.getAttribute('data-id'),
      data: { candidate: this.props.data },
      dataId: this.props.data.uid
    });
  }

  setWinner(){
    console.log("Setting winner:", this.props.data.id);

    this.context.socket.emit(SetWinnerKey, this.props.data);
  }

  clearWinner(){
    console.log("Clearing winner:", this.props.data.id);

    this.context.socket.emit(ClearWinnerKey, this.props.data);
  }

  render() {
    const hasManifestoPoints = this.props.data.manifestoOne.length > 2 || this.props.data.manifestoTwo.length > 2 || this.props.data.manifestoThree.length > 2;

    const overCss = Object.assign({marginTop: this.state.top}, overlayCss);

    const overlayContent = (
      <Popover id="" title="More Templates" style={overCss}>
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
            <Button onClick={() => this.clearWinner()}>Clear Elect</Button> :
            <Button onClick={() => this.setWinner()}>Mark Elect</Button>
        }
      </Popover>
    );

    const isValid = this.props.data.Position && this.props.data.Position.type;
    const isCandidate = isValid && this.props.data.Position.type.indexOf('candidate') == 0;

    if(!isValid)
      return (<p></p>);

    return (
      <Col md={4} sm={6} xs={12} style={{ textAlign: "center" }}>
        <p>{ this.props.data.firstName } { this.props.data.lastName } - { this.props.data.Position.miniName } { this.props.data.elected ? " Elect" : "" }</p>
        <p>
          <Button data-id="lowerThird" onClick={(e) => this.runTemplate(e)}>Lower Third</Button>&nbsp;
          {
            isCandidate ?
            <OverlayTrigger key={Date.now()} trigger="click" placement="right" rootClose overlay={ overlayContent }>
              <Button bsStyle="info">More</Button>
            </OverlayTrigger> :
            ""
          }
        </p>
      </Col>
    );
  }
}

PersonEntry.contextTypes = {
  socket: React.PropTypes.object.isRequired
};
