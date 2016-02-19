/*
* External Dependancies
*/

import React from 'react';
import {
  Grid, Row, Col, 
  Input, Button
} from 'react-bootstrap';
import Socket from 'react-socket';

/*
* Variables
*/
const GetPeopleKey = "getPeople";

/*
* React
*/
export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      people: [],
      filter: ""
    }
  }

  componentDidMount() {
    this.updateData();
  }

  updateData(){
    this.refs.sock.socket.emit(GetPeopleKey);
  }

  filterNames(e){
    var filter = this.refs.filter.getValue();
    this.setState({ filter });
  }

  loadedNames(data){
    var people = JSON.parse(data);

    this.setState({ people });
    console.log(people);
  }

  render() {
    var peopleList = this.state.people
      .filter((p) => Dashboard.filterPerson(this.state.filter, p))
      .map((p) => <PersonEntry key={p.id} data={p} />);

    return (
      <div>
        <Socket.Event name={ GetPeopleKey } callback={ this.loadedNames.bind(this) } ref="sock"/>

        <Grid>
          <Row>
            <Col xs={12}>
              <Input type="text" label="Search:" onChange={this.filterNames.bind(this)} ref="filter" />
              <hr />

              { peopleList }
            </Col>
          </Row>
        </Grid>
      </div>    
    );
  }

  static filterPerson(filter, p){
    if(filter == "")
      return true;

    filter = filter.toLowerCase();

    var name = p.firstName + " " + p.lastName;
    if(name.toLowerCase().indexOf(filter) != -1)
      return true;

    return false;
  }
}

class PersonEntry extends React.Component {
  render() {
    return (
      <Col md={4} sm={6} xs={12} style={{ textAlign: "center" }}>
        <p>{ this.props.data.firstName } { this.props.data.lastName }</p>
        <p>
          <Button>Lower Third</Button>
          <Button>More</Button>
        </p>
      </Col>
    );
  }
}