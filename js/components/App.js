/*
* External Dependancies
*/

import React from 'react';
import io from 'socket.io-client';

/*
* Internal Dependancies
*/
import TopBar from './TopBar'

/*
* Variables
*/
const socket = io();

/*
* React
*/
export default class App extends React.Component {
  render() {
    return (
      <TopBar />
    );
  }
}
