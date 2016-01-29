/*
* External Dependancies
*/

import React from 'react';
import io from 'socket.io-client';

/*
* Internal Dependancies
*/

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
      <div>
        Hello
      </div>
    );
  }
}
