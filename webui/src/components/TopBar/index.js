import React from 'react';
import {
  MenuItem,
  Navbar,
  Nav,
} from 'react-bootstrap';


export default class TopBar extends React.Component {
  render() {
    return (
      <Navbar fixedTop>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#">Guild Elections Graphics</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight>
            <MenuItem eventKey={1.1} href={"#/"}>Dashboard</MenuItem>
            <MenuItem eventKey={1.2} href={"#/lowerthird"}>Lower Thirds</MenuItem>
            <MenuItem eventKey={1.4} href={"#/ticker"}>Ticker</MenuItem>
            <MenuItem eventKey={1.5} href={"#/edit"}>Edit</MenuItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
