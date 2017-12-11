import React from 'react';
import {
  Grid, Row, Col,
  Tabs, Tab
} from 'react-bootstrap';

import PeopleList from './PeopleList';
import Boards from './Boards';
import Elections from './Elections';
import Footer from './Footer';
import Misc from './Misc';

let bodyStyle = {
  overflowY: "scroll",
  height: "calc(100vh - 72px - 200px)"
};

export default class Dashboard extends React.Component {
  scroll() {
    this.peopleElm.scroll();
  }

  render() {
    return (
      <div>
        <div style={bodyStyle} onScroll={() => this.scroll()}>
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
        <Footer />
      </div>
    );
  }
}
