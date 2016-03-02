/*
* External Dependancies
*/

import React from 'react';
import Socket from 'react-socket';
import {
  Table, Button, Grid, Row, Col
} from 'react-bootstrap';

/*
* Variables
*/
const GetElectionsKey = "getElections";


/*
* React
*/
export default class Elections extends React.Component {
  constructor(props) {
    super(props);
    this.state = {elections: []}
  }

  componentDidMount() {
    this.refs.sock.socket.emit(GetElectionsKey)
  }

  addRound() {

  }

  saveRound() {

  }

  render() {
    return (
      <div>
        <Grid>
          <Row>
            <h3>Sabbatiacl</h3>
              <Col md={4}>
                <h4>Role</h4>
                <Table bordered>
                  <thead>
                    <tr>
                      <th>Round #</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Place</th>
                      <th>Votes</th>
                      <th><Button bsStyle="danger" onClick={this.addRound.bind(this)}>Add Round</Button></th>
                    </tr>
                  </thead>
                  <tbody>
                  <td>1</td>
                  <td>Joel</td>
                  <td>Garner</td>
                  <td>2nd</td>
                  <td>9001</td>
                  <td><Button bsStyle="success" onClick={this.saveRound.bind(this)}>Save</Button></td>
                  </tbody>
              </Table>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
