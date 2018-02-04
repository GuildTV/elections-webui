import React from 'react';
import axios from 'axios';
import {
  Col,
  Button,
  Popover, OverlayTrigger
} from 'react-bootstrap';

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

    axios.post('/api/run/person/'+this.props.data.id+'/'+e.target.getAttribute('data-id'))
    .then(() => {
      console.log("Run template");
    })
    .catch(err => {
      alert("Run template error:", err);
    });
  }

  setWinner(){
    console.log("Setting winner:", this.props.data.id);

    axios.post('/api/person/'+this.props.data.id+'/win')
    .then(() => {
      console.log("Set winner");
    })
    .catch(err => {
      alert("Set winner error:", err);
    });
  }

  clearWinner(){
    console.log("Clearing winner:", this.props.data.id);

    axios.post('/api/person/'+this.props.data.id+'/lose')
    .then(() => {
      console.log("Set loser");
    })
    .catch(err => {
      alert("Set loser error:", err);
    });
  }

  render() {
    if(!this.props.data.Position && this.props.data.Position.type)
      return (<p></p>);

    const overCss = Object.assign({marginTop: this.state.top}, overlayCss);

    const overlayContent = (
      <Popover id="" title="More Templates" style={overCss}>
        {
          this.props.data.elected ?
            <Button onClick={() => this.clearWinner()}>Clear Elect</Button> :
            <Button onClick={() => this.setWinner()}>Mark Elect</Button>
        }
      </Popover>
    );

    return (
      <Col lg={3} md={4} sm={6} xs={12} style={{ textAlign: "center" }}>
        <p>{ this.props.data.firstName } { this.props.data.lastName } - { this.props.data.Position.miniName } { this.props.data.elected ? " Elect" : "" }</p>
        <p>
          {
            this.props.data.hasPhoto ? 
              <Button data-id="SidebarPhoto" onClick={(e) => this.runTemplate(e)}>Sidebar - Photo</Button>: 
              ""
          } &nbsp;
          <Button data-id="sidebarText" onClick={(e) => this.runTemplate(e)}>Sidebar - Text</Button>&nbsp;
          <OverlayTrigger key={Date.now()} trigger="click" placement="right" rootClose overlay={ overlayContent }>
            <Button bsStyle="primary">More</Button>
          </OverlayTrigger> 
        </p>
      </Col>
    );
  }
}
