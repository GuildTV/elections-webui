/*
* External Dependancies
*/

import React from 'react';
import $ from 'jquery';
import {
  Col,
  Form, FormGroup, FormControl, ControlLabel, Button
} from 'react-bootstrap';
import Socket from 'react-socket';

import PersonEntry from './PersonEntry';

/*
* Variables
*/
const GetPeopleKey = "getPeople";
const UpdatePeopleKey = "updatePeople";

/*
* React
*/
export default class PeopleList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      people: [],
      filter: ""
    };
  }

  componentDidMount() {
    this.updateData();
  }

  updateData(){
    this.sock.socket.emit(GetPeopleKey);
  }

  handleStateChange(newData) {
    console.log("PEOPLE", newData);

    let people = this.state.people;
    newData.map(person => {
      const index = people.findIndex(p => p.uid == person.uid);
      if(index >= 0)
        people[index] = person;
      else
        people.push(person);
    });

    this.setState({people});
  }

  filterNames(e){
    const filter = e.target.value;
    this.setState({ filter });
  }

  loadedNames(people){
    this.setState({ people });
  }

  render() {
    const peopleList = this.state.people
      .filter((p) => PeopleList.filterPerson(this.state.filter, p))
      .map((p) => <PersonEntry key={p.id} sock={this.sock} parent={this} data={p} />);

    $('.popover').remove();

    return (
      <div>
        <Socket.Listener event={ GetPeopleKey } callback={d => this.loadedNames(d)} ref={e => this.sock = e} />
        <Socket.Listener event={ UpdatePeopleKey } callback={d => this.handleStateChange(d)} />

        <Form horizontal>
          <FormGroup>
            <Col componentClass={ControlLabel} xs={2}>
              Search:
            </Col>
            <Col xs={8}>
              <FormControl type="text" onChange={e => this.filterNames(e)} />
            </Col>
            <Col xs={2}>
              <Button bsStyle="success" onClick={() => this.updateData()}>Refresh Data</Button>
            </Col>
          </FormGroup>
        </Form>
        <hr />

        { peopleList }
      </div>
    );
  }

  static filterPerson(filter, p){
    if(filter == "")
      return true;

    filter = filter.toLowerCase();

    const name = p.firstName + " " + p.lastName;
    if(name.toLowerCase().indexOf(filter) != -1)
      return true;

    if (p.Position) {
      const position = p.Position.miniName;
      if(position.toLowerCase().indexOf(filter) != -1)
        return true;
    } else {
      console.log("MISSING POSITION:", p);
    }

    return false;
  }
}
