/*
* External Dependancies
*/

import React from 'react';
import $ from 'jquery';
import {
  Grid, Row, Col, 
  Input, Button,
} from 'react-bootstrap';
import Socket from 'react-socket';

import PersonEntry from './PersonEntry';

/*
* Variables
*/
const GetPeopleKey = "getPeople";

/*
* React
*/
export default class PeopleList extends React.Component {
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

  loadedNames(people){
    this.setState({ people });
    console.log(people);
  }

  render() {
    var peopleList = this.state.people
      .filter((p) => PeopleList.filterPerson(this.state.filter, p))
      .map((p) => <PersonEntry key={p.id} refs={this.refs} parent={this} data={p} />);

    $('.popover').remove();


    return (
      <div>
        <Socket.Event name={ GetPeopleKey } callback={ this.loadedNames.bind(this) } ref="sock"/>

        <form className="form-horizontal">
          <Input label="Search:" labelClassName="col-xs-2" wrapperClassName="col-xs-10">
            <Row>
              <Col xs={10}>
                <Input type="text" onChange={this.filterNames.bind(this)} ref="filter"  />
              </Col>
              <Col xs={2}>
                <Button bsStyle="success" onClick={this.updateData.bind(this)}>Refresh Data</Button>
              </Col>
            </Row>
          </Input>
        </form>
        <hr />

        { peopleList }
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
