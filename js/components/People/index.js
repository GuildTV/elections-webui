/*
* External Dependancies
*/

import React from 'react';
import io from 'socket.io-client';

import Table from 'react-bootstrap/lib/Table';
/*
* Variables
*/
const socket = io();

/*
* React
*/
export default class People extends React.Component {
  constructor(props) {
    super(props);
    this.state = {people: []}
    socket.on('getPeople', (data) => this.handelInitialData(data));
    socket.on('updatePeople', (newData) => this.handleStateChange(newData));
  }

  handelInitialData(data) {
    console.log(data)
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
    socket.emit('getPeople')
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
