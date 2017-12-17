import React from 'react';
import { Link } from 'react-router';
import axios from 'axios';

import { 
  Grid, Row, Col, 
  Table, Button, Form,
} from 'react-bootstrap';

export default class TweetList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tweets: []
    };
  }

  // componentDidMount() {
  //   this.updateData();
  // }
  // componentWillUnmount(){
  //   this.setState({
  //     tweets: [],
  //   });
  // }
  // updateData(){
  //   axios.get('/api/positions')
  //   .then(res => {
  //     this.setState({ positions: res.data || [] });
  //     console.log("Loaded " + res.data.length + " positions");
  //   })
  //   .catch(err => {
  //     this.setState({ tweets: [] });
  //     alert("Get positions error:", err);
  //   });
  // }

  render() {
    const tweets = this.state.tweets.map(tw => {
      return (
        <tr key={ tw.id }>
          <td>{ pos.type }</td>
          <td>{ pos.fullName }</td>
          <td>{ pos.compactName }</td>
          <td>{ pos.miniName }</td>
          <td>{ pos.type.indexOf("candidate") != 0 ? "" : pos.order }</td>
          <td>{ pos.type.indexOf("candidate") != 0 ? "" : pos.winnerOrder }</td>
          <td>
            <Link to={`/edit/position/${pos.id}`}>View</Link>
          </td>
        </tr>
      );
    });

    return (
      <div>
        <Grid>
          <Row>
            <Col xs={12}>
              <div style={this.props.style}>
                <Form horizontal>
                  <fieldset>
                    <legend>Tweets</legend>

                    { tweets }
                  </fieldset>
                </Form>
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
