/*
* External Dependancies
*/

import React from 'react';
import io from 'socket.io-client';

/*
* Variables
*/
const socket = io();

/*
* React
*/
export default class Dashboard extends React.Component {
  render() {
    return (
      <div>Dashboard</div>
    );
  }
}
