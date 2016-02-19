/*
* External Dependancies
*/
import React from 'react';
import Socket from 'react-socket';

import { 
  Grid, Row, Col
} from 'react-bootstrap';

/*
* Internal Dependancies
*/

/*
* Variables
*/

const footerCss = {
  position: "absolute",
  bottom: 0,
  width: "100%",
  height: "200px",
  backgroundColor: "#f5f5f5"
}

/*
* React
*/
export default class Footer extends React.Component {
  render() {
    return (
      <footer style={footerCss}>
        <Grid>
          <Row>
            <Col xs={12}>
              <p>Active: </p>
            </Col>
          </Row>
        </Grid>
      </footer>
    );
  }
}
