import React from 'react';
import axios from 'axios';
import { Link } from 'react-router';
import { Grid, Row, Col, Table, Button, Form } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

export class ViewPosition extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      data: {}
    };
  }

  componentDidMount() {
    this.updateData(this.props);
  }
  componentWillReceiveProps(props){
    this.updateData(props);
  }
  componentWillUnmount(){
    this.setState({
      data: {},
    });
  }
  updateData(props){
    const id = props.params.id;
    axios.get('/api/position/'+id+'')
    .then(res => {
      this.setState({ data: res.data || {} });
      console.log("Loaded position ");
    })
    .catch(err => {
      this.setState({ data: {} });
      alert("Get people error:", err);
    });
  }


  render() {
    let rows = (this.state.data.People || []).map((person) => {
      return (
        <tr key={ person.uid }>
          <td>{ person.uid }</td>
          <td>{ person.firstName }</td>
          <td>{ person.lastName }</td>
          <td>{ person.elected?"Y":"" }</td>
          <td>{ person.order }</td>
          <td>
            <Link to={`/edit/person/${person.id}`}>Edit</Link>
          </td>
        </tr>
      );
    });

    return (
      <div>
        <Grid>
          <Row>
            <Col xs={12}>
              <div style={this.props.style}>
                <Form horizontal>
                  <fieldset>
                    <legend>View position - { this.state.data.fullName }</legend>
                    <p>
                      <LinkContainer to={`/edit`}>
                        <Button bsStyle="default">Back to list</Button>
                      </LinkContainer>
                      <LinkContainer to={`/edit/position/${this.state.data.id}/edit`}>
                        <Button bsStyle="primary">Edit</Button>
                      </LinkContainer>
                      <LinkContainer to={`/edit/person/create/${this.state.data.id}`}>
                        <Button bsStyle="primary">Add person</Button>
                      </LinkContainer>
                    </p>

                    <Table bordered>
                      <thead>
                        <tr>
                          <th>UID</th>
                          <th>First Name</th>
                          <th>Last Name</th>
                          <th>Elected</th>
                          <th>Order</th>
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
