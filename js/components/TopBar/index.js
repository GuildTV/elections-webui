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
  NavDropdown,
  Button
} from 'react-bootstrap';

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
              <MenuItem eventKey={1.1} href="#">Dashboard</MenuItem>
              <MenuItem eventKey={1.2} href="#/people">People</MenuItem>
              <MenuItem eventKey={1.3}>Elections</MenuItem>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
