import React from 'react';
import socket from 'socket.io-client';
import {
  Grid, Row, Col,
  Tabs, Tab
} from 'react-bootstrap';
import equal from 'deep-equal';

import PeopleList from '../Components/PeopleList';
import Sidebar from '../Components/Sidebar';

import PersonEntry from './PersonEntry';
import Boards from './Boards';
import Elections from './Elections';
import Footer from './Footer';
// import Misc from './Misc';

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
      if (d.slot != "default")
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

    this.socket.emit('cviz.status', { slot: "default" });

    this.inflight = true;
  }

  filterPeople(p){
    const isValid = p.Position && p.Position.type;
    if (!isValid)
      return false;

    const hasManifestoPoints = p.manifestoOne.length > 2 || p.manifestoTwo.length > 2 || p.manifestoThree.length > 2;
    const isCandidate = isValid && p.Position.type.indexOf('candidate') == 0;

    return isCandidate && hasManifestoPoints;
  }

  render() {

    // <Tab eventKey={4} title="Misc">
      // <Misc />
    // </Tab>

    return (
      <div className="sidebar">
        <Sidebar data={this.state.data} slot="default" />
        <div id="dashTabs" style={bodyStyle} onScroll={() => this.scroll()}>
          <Grid fluid={true}>
            <Row>
              <Col xs={12}>
                <Tabs animation={false} id="tabs">
                  <Tab eventKey={1} title="People">
                    <PeopleList ref={e => this.peopleElm = e} filter={this.filterPeople} control={PersonEntry} hasTabs={true} />
                  </Tab>
                  <Tab eventKey={2} title="Boards">
                    <Boards />
                  </Tab>
                  <Tab eventKey={3} title="Graphs" >
                    <Elections />
                  </Tab>
                </Tabs>
              </Col>
            </Row>
          </Grid>
        </div>
        <Footer data={this.state.data} slot="default" />
      </div>
    );
  }
}
