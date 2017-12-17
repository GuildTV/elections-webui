import React from 'react';
import {
  MenuItem,
  Navbar,
  Nav,
} from 'react-bootstrap';

import { twitter } from "../../../config";

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
            { twitter.enable ? <MenuItem eventKey={1.1} href={"#/twitter"}>Twitter</MenuItem> : "" }
            <MenuItem eventKey={1.3} href={"#/edit"}>Edit</MenuItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
