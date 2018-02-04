import React from 'react';
import socket from 'socket.io-client';
import axios from 'axios';
import {
  Grid, Row, Col,
  Tabs, Tab
} from 'react-bootstrap';
import equal from 'deep-equal';

import PeopleList from '../Components/PeopleList';
import Sidebar from '../Components/Sidebar';

import PersonEntry from './PersonEntry';
import Footer from './Footer';
import RandomInput from './RandomInput';

let bodyStyle = {
  marginBottom: "200px",
};

export default class Dashboard extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      data: {
        adjustments: [],
        state: {},
      },
    };
    this.inflight = false;
  }

  scroll() {
    this.peopleElm.scroll();
  }

  componentDidMount(){
    this.socket = socket();

    this.socket.on('people.reload', () => this.peopleElm.updateData());

    this.socket.on('cviz.status', d => {
      if (d.slot != "lowerthird")
        return;

      console.log("CViz: new status");
      this.inflight = false;

      if (!equal(d.data, this.state.data))
         this.setState({ data: d.data });
    });

    this.updateData();

    this.interval = setInterval(() => {
      this.updateData();
    }, 500);
  }
  componentWillUnmount(){
    this.socket.close();

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
  updateData(){
    if (this.inflight)
      return;

    this.socket.emit('cviz.status', { slot: "lowerthird" });

    this.inflight = true;
  }

  filterPeople(p){
    return p.Position && p.Position.type;
  }

  showCustom(){
    this.Editor.open().then(d => {
      axios.post('/api/run/lowerthird', d)
      .then(() => {
        console.log("Run custom lowerthird");
      })
      .catch(err => {
        alert("Run custom lowerthird error:", err);
      });
    });
  }

  render() {
    return (
      <div className="sidebar">
        <RandomInput ref={e => this.Editor = e} />

        <Sidebar data={this.state.data} slot="lowerthird" />
        <div id="dashTabs" style={bodyStyle} onScroll={() => this.scroll()}>
          <Grid fluid={true}>
            <Row>
              <Col xs={12}>
                <PeopleList ref={e => this.peopleElm = e} filter={this.filterPeople} control={PersonEntry} addCustom={() => this.showCustom()} />
              </Col>
            </Row>
          </Grid>
        </div>
        <Footer data={this.state.data} slot="lowerthird" />
      </div>
    );
  }
}
