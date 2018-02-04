import React from 'react';
import axios from 'axios';
import {
  Col,
  Button,
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

  render() {
    const { Position, elected, firstName, lastName, hasPhoto } = this.props.data;
    if(!Position && Position.type)
      return (<p></p>);

    return (
      <Col lg={3} md={4} sm={6} xs={12} style={{ textAlign: "center" }}>
        <p>{ firstName } { lastName } - { Position.miniName } { elected ? " Elect" : "" }</p>
        <p>
          {
            hasPhoto ? 
              <Button data-id="SidebarPhoto" onClick={(e) => this.runTemplate(e)}>Sidebar - Photo</Button>: 
              ""
          } &nbsp;
          <Button data-id="sidebarText" onClick={(e) => this.runTemplate(e)}>Sidebar - Text</Button>&nbsp;
        </p>
      </Col>
    );
  }
}
