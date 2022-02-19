import React from 'react';
import { Link } from 'react-router';
import axios from 'axios';

import {
  Grid, Row, Col,
  Table, Button, Form,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

export class PositionList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      positions: []
    };
  }

  componentDidMount() {
    this.updateData();
  }
  componentWillUnmount(){
    this.setState({
      positions: [],
    });
  }
  updateData(){
    axios.get('/api/positions')
    .then(res => {
      this.setState({ positions: res.data || [] });
      console.log("Loaded " + res.data.length + " positions");
    })
    .catch(err => {
      this.setState({ positions: [] });
      alert("Get positions error:", err);
    });
  }

  render() {
    let rows = this.state.positions.map(pos => {
      return (
        <tr key={ pos.id }>
          <td>{ pos.type }</td>
          <td>{ pos.fullName }</td>
          <td>{ pos.compactName }</td>
          <td>{ pos.miniName }</td>
          <td>{ pos.type.indexOf("candidate") != 0 ? "" : pos.order }</td>
          <td>{ pos.type.indexOf("candidate") != 0 ? "" : pos.winnerOrder }</td>
          <td>{ pos.People.length }</td>
          <td>
            <Link to={`/edit/position/${pos.id}`}>View</Link>
          </td>
        </tr>
      );
    });

    return (
      <div className="scroller">
        <Grid>
          <Row>
            <Col xs={12}>
              <div style={this.props.style}>
                <Form horizontal>
                  <fieldset>
                    <legend>Positions</legend>
                    <p>
                      <LinkContainer to={`/edit/person/create`}>
                        <Button bsStyle="primary">Add person</Button>
                      </LinkContainer>
                      <LinkContainer to={`/edit/position/create`}>
                        <Button bsStyle="primary">Add position</Button>
                      </LinkContainer>
                    </p>

                    <Table bordered>
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Full</th>
                          <th>Compact</th>
                          <th>Mini</th>
                          <th>Board Order</th>
                          <th>Win Order</th>
                          <th>Candidates</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                      { rows }
                      </tbody>
                    </Table>
                  </fieldset>
                </Form>
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
