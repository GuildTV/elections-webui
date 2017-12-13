import React from 'react';
import axios from 'axios';
import {
  Grid, Row, Col,
  Tabs, Tab
} from 'react-bootstrap';
import equal from 'deep-equal';

import PeopleList from './PeopleList';
import Boards from './Boards';
import Elections from './Elections';
import Footer from './Footer';
import Misc from './Misc';
import Sidebar from './Sidebar';

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
    this.updateData();

    this.interval = setInterval(() => {
      this.updateData();
    }, 50);
  }
  componentWillUnmount(){
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
  updateData(){
    if (this.inflight)
      return;

    this.inflight = true;
    axios.get('/api/cviz/status')
    .then(res => {
      this.inflight = false
      if (!equal(res.data, this.state.data))
        this.setState({ data: res.data });
    })
    .catch(err => {
      this.inflight = false
      this.setState({
        data: {
          adjustments: [],
          state: {},
        },
      });
      console.log(err)
    });
  }

  render() {
    return (
      <div className="sidebar">
        <Sidebar data={this.state.data} />
        <div id="dashTabs" style={bodyStyle} onScroll={() => this.scroll()}>
          <Grid fluid={true}>
            <Row>
              <Col xs={12}>
                <Tabs animation={false} id="tabs">
                  <Tab eventKey={1} title="People">
                    <PeopleList ref={e => this.peopleElm = e} />
                  </Tab>
                  <Tab eventKey={2} title="Boards">
                    <Boards />
                  </Tab>
                  <Tab eventKey={3} title="Elections" >
                    <Elections />
                  </Tab>
                  <Tab eventKey={4} title="Misc">
                    <Misc />
                  </Tab>
                </Tabs>
              </Col>
            </Row>
          </Grid>
        </div>
        <Footer data={this.state.data} />
      </div>
    );
  }
}
