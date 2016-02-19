/*
* External Dependancies
*/

import React from 'react';

import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

/*
* Internal Dependancies
*/
import People from './People'
import Person from './Person'

/*
* Variables
*/

/*
* React
*/
export default class EditPeople extends React.Component {
  render() {
    return (
      <div>
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
