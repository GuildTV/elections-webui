/*
* External Dependancies
*/

import React from 'react';

import { Grid, Row, Col } from 'react-bootstrap';

/*
* Internal Dependancies
*/
import PeopleList from './PeopleList'
import Person from './Person'

/*
* Variables
*/

/*
* React
*/
export default class EditPeople extends React.Component {
  LoadData(e){
    var data = e.target.getAttribute('data');
    data = JSON.parse(data);

    console.log("Editing:", data.id);
    
    this.refs.edit.LoadForm(data);
  }

  render() {
    return (
      <div>
        <Grid>
          <Row>
            <Col xs={12}>
              <PeopleList onEdit={this.LoadData.bind(this)} ref="list" />
              <Person ref="edit" />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
