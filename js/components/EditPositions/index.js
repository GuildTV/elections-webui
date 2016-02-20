/*
* External Dependancies
*/

import React from 'react';

import { Grid, Row, Col } from 'react-bootstrap';

/*
* Internal Dependancies
*/
import PositionList from './PositionList'
import Position from './Position'

/*
* Variables
*/

/*
* React
*/
export default class EditPositions extends React.Component {
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
              <PositionList onEdit={this.LoadData.bind(this)} ref="list" />
              <Position ref="edit" />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
