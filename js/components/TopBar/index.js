/*
* External Dependancies
*/
import React from 'react';
import Socket from 'react-socket';

import MenuItem from 'react-bootstrap/lib/MenuItem';
import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import NavDropdown from 'react-bootstrap/lib/NavDropdown';
import Button from 'react-bootstrap/lib/Button';

/*
* Internal Dependancies
*/

/*
* Variables
*/

/*
* React
*/
export default class TopBar extends React.Component {
  render() {
    return (
      <Navbar inverse>
        <Socket.Socket />
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#">Guild Elections WebUI</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight>
            <NavDropdown eventKey={1} title="Edit" id="basic-nav-dropdown">
              <MenuItem eventKey={1.1} href="#/people">People</MenuItem>
              <MenuItem eventKey={1.2}>Elections</MenuItem>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
