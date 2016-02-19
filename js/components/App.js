/*
* External Dependancies
*/

import React from 'react';
import io from 'socket.io-client';

import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

/*
* Internal Dependancies
*/
import TopBar from './TopBar'
import People from './People'
import Person from './Person'

/*
* Variables
*/
const socket = io();

/*
* React
*/
export default class App extends React.Component {
  render() {
    return (
      <div>
        <TopBar />
        <Grid>
          <Row>
            <Col xs={12}>
              <People />
              <Person />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
