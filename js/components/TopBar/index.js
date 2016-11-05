/*
* External Dependancies
*/
import React from 'react';
import Socket from 'react-socket';

import {
  MenuItem,
  Navbar,
  Nav,
  NavItem,
  NavDropdown
} from 'react-bootstrap';

/*
* Internal Dependancies
*/

/*
* Variables
*/
const RunTemplateKey = "runTemplate";

/*
* React
*/
export default class TopBar extends React.Component {

  runTemplate(e){
    let target = e.target;
    if(!e.target.hasAttribute('data-id'))
      target = target.parentElement;

    console.log("Running template:", target.getAttribute('data-id'));

    this.refs.sock.socket.emit(RunTemplateKey, {
      template: target.getAttribute('data-id'),
      data: target.getAttribute('data-data'),
      dataId: target.getAttribute('data-key')
    });
  }

  render() {
    return (
      <Navbar inverse>
        <Socket.Socket />
        <Socket.Event name="test" ref="sock"/>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#">Guild Elections WebUI</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight>
            <NavDropdown eventKey={1} title="Edit" id="basic-nav-dropdown">
              <MenuItem eventKey={1.1} href="#">Dashboard</MenuItem>
              <MenuItem eventKey={1.2} href="#/people">People</MenuItem>
              <MenuItem eventKey={1.3} href="#/positions">Positions</MenuItem>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
