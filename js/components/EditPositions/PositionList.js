/*
* External Dependancies
*/

import React from 'react';
import Socket from 'react-socket';

import { Table, Button } from 'react-bootstrap';

/*
* Variables
*/

const GetPositionKey = "getPositions";
const UpdatePositionKey = "updatePosition";

/*
* React
*/
export default class PositionList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {positions: []}
  }

  sortData(positions){
    positions.sort((a,b) => {
      if(a.type < b.type)
        return -1;
      if(a.type > b.type)
        return 1;
      
      if(a.order < b.order)
        return -1;
      if(a.order > b.order)
        return 1;
      return 0;
    });

    return positions;
  }

  handelInitialData(positions) {
    positions = this.sortData(positions);
    this.setState({ positions });
  }

  handleStateChange(newData) {
    let isNew = true;
    let positions = this.state.positions.map((pos) => {
      if (pos.id === newData.id) {
        isNew = false;
        return newData;
      } else {
        return pos;
      }
    });

    if(isNew) {
      positions.push(newData);
    }

    positions = this.sortData(positions);

    console.log(positions)
    this.setState({positions});
  }

  componentDidMount() {
    this.refs.sock.socket.emit(GetPositionKey)
  }

  render() {
    let rows = this.state.positions.map((pos) => {
      return (
        <tr key={ pos.id }>
          <td>{ pos.type }</td>
          <td>{ pos.fullName }</td>
          <td>{ pos.compactName }</td>
          <td>{ pos.miniName }</td>
          <td>{ pos.order }</td>
          <td>
            <Button onClick={this.props.onEdit} data={JSON.stringify(pos)}>Edit</Button>
          </td>
        </tr>
      );
    });

    return (
      <div style={this.props.style}>
        <Socket.Event name={ GetPositionKey } callback={ this.handelInitialData.bind(this) } ref="sock"/>
        <Socket.Event name={ UpdatePositionKey } callback={ this.handleStateChange.bind(this) } />
        <Table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Full</th>
              <th>Compact</th>
              <th>Mini</th>
              <th>Order</th>
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
