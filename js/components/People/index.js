/*
* External Dependancies
*/

import React from 'react';
import Socket from 'react-socket';

import { Table } from 'react-bootstrap';

/*
* Variables
*/

const GetPeopleKey = "getPeople";
const UpdatePeopleKey = "updatePeople";

/*
* React
*/
export default class People extends React.Component {
  constructor(props) {
    super(props);
    this.state = {people: []}
  }

  handelInitialData(data) {
    var people = JSON.parse(data);

    this.setState({ people });
  }

  handleStateChange(newData) {
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
          <td>{ person.profile }</td>
          <td>{ person.firstName }</td>
          <td>{ person.lastName }</td>
          <td>{ person.type }</td>
          <td>{ person.title }</td>
          <td>{ person.candidate }</td>
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
              <th>Profile</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Type</th>
              <th>Title</th>
              <th>Candidate</th>
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
