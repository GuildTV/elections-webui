/*
* External Dependancies
*/

import React from 'react';
import { Grid, Row, Col, Button } from 'react-bootstrap';

/*
* Internal Dependancies
*/
import PositionList from './PositionList';
import Position from './Position';

/*
* React
*/
export default class EditPositions extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      listMode: false
    };
  }

  LoadData(e){
    let data = e.target.getAttribute('data');
    data = JSON.parse(data);

    console.log("Editing:", data.id);

    this.editElm.LoadForm(data);
    this.toggleList(false);
  }

  toggleList(vis){
    if (vis === null || vis === undefined)
      vis = !this.state.listMode;

    this.setState({ listMode: vis });
  }

  render() {
    const listStyle = { display: "none" };
    if (this.state.listMode)
      listStyle.display = "block";

    return (
      <div>
        <Grid>
          <Row>
            <Col xs={12}>
              <p><Button bsStyle="primary" onClick={() => this.toggleList()}>Toggle List</Button></p>
              <PositionList onEdit={e => this.LoadData(e)} style={listStyle} />
              <Position ref={e => this.editElm = e} />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
