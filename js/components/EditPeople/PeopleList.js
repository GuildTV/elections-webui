/*
* External Dependancies
*/

import React from 'react';
import Socket from 'react-socket';

import { Table, Button } from 'react-bootstrap';

/*
* Variables
*/

const GetPeopleKey = "getPeople";
const UpdatePeopleKey = "updatePerson";

/*
* React
*/
export default class PeopleList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {people: []}
  }

  handelInitialData(people) {
    this.setState({ people });
  }

  handleStateChange(newData) {
    console.log("PERSON", newData);

    let isNewPerson = true;
    let people = this.state.people.map((person) => {
      if (person.uid === newData.uid) {
        isNewPerson = false;
        return newData;
      } else {
        return person;
      }
    });

    if(isNewPerson) {
      people.push(newData);
    }
    console.log(people)
    this.setState({people});
  }

  componentDidMount() {
    this.refs.sock.socket.emit(GetPeopleKey)
  }

  render() {
    let rows = this.state.people.map((person) => {
      console.log(person);

      return (
        <tr key={ person.uid }>
          <td>{ person.uid }</td>
          <td>{ person.firstName }</td>
          <td>{ person.lastName }</td>
          <td>{ person.position?person.position.miniName:"ERROR" }</td>
          <td>{ person.elected?"Y":"" }</td>
          <td>
            <Button onClick={this.props.onEdit} data={JSON.stringify(person)}>Edit</Button>
          </td>
        </tr>
      );
    });

    return (
      <div>
        <Socket.Event name={ GetPeopleKey } callback={ this.handelInitialData.bind(this) } ref="sock"/>
        <Socket.Event name={ UpdatePeopleKey } callback={ this.handleStateChange.bind(this) } />
        <Table>
          <thead>
            <tr>
              <th>UID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Position</th>
              <th>Elected</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
          { rows }
          </tbody>
        </Table>
      </div>
    );
  }
}
