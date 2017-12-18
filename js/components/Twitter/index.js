import React from 'react';
import socket from 'socket.io-client';
import update from 'immutability-helper';

import { 
  Grid, Row, Col, 
  Button,
} from 'react-bootstrap';

export default class TweetList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tweets: {}
    };
  }

  componentDidMount() {
    this.socket = socket();
    this.socket.emit('twitter.all');

    this.socket.on('twitter.all', d => {
      console.log("Twitter: Fresh list");
      this.setState({ tweets: d });
    });
    this.socket.on('twitter.delete', d => {
      console.log("Twitter: Got delete", d);

      this.setState(update(this.state, { tweets: {$unset: [ d.raw_id ] } }));
    });
    this.socket.on('twitter.show', d => {
      console.log("Twitter: Showing tweet", d);
      d.visible = true;

      const toRemove = [];
      for (let v of Object.keys(this.state.tweets)){
        if (this.state.tweets[v].visible)
          toRemove.push(v);
      }

      const up = { tweets: { $unset: toRemove } };
      up.tweets[d.raw_id] = {$set: d };
      this.setState(update(this.state, up));
    });
    this.socket.on('twitter.clear', () => {
      console.log("Twitter: Clear Live");

      const toRemove = [];
      for (let v of Object.keys(this.state.tweets)){
        if (this.state.tweets[v].visible)
          toRemove.push(v);
      }

      this.setState(update(this.state, { tweets: { $unset: toRemove } }));
    });
    this.socket.on('twitter.latest', d => {
      console.log("Twitter: More tweets:", d);
      this.setState(update(this.state, { tweets: { $merge: d } }));
    });
  }
  componentWillUnmount(){
    this.socket.close();
  }

  hideTweet(id, raw_id) {
    console.log("Twitter: Delete", id);
    this.socket.emit("twitter.delete", { 
      id: id,
      raw_id: raw_id,
    });
  }

  useTweet(id, raw_id) {
    console.log("Twitter: Show tweet:", id);

    this.socket.emit('twitter.show', {
      id: id,
      raw_id: raw_id,
    });
  }

  clearScreen() {
    console.log("Twitter: Clear screen");

    this.socket.emit('twitter.clear', {});
  }

  render() {
    const tweets = [];
    const keys = Object.keys(this.state.tweets);
    keys.sort().reverse();
    for (let t of keys){
      const tw = this.state.tweets[t];
      tweets.push(
        <div key={ tw.id } className={"tweet-entry" + (tw.visible ? " visible-tweet" : "")}>
          <table>
            <tbody>
              <tr>
                <td className="tweet">
                  <h2>{ tw.username } (@{ tw.handle })</h2>
                  <p className="text">{ tw.text }</p>

                  <p>
                      <Button bsStyle="warning" onClick={() => this.hideTweet(tw.id, tw.raw_id) }>Skip</Button> 
                      <Button bsStyle="success" onClick={() => this.useTweet(tw.id, tw.raw_id) }>Show Tweet</Button>
                  </p>
                </td>
                { tw.img ? 
                  <td className="image">
                    <a href={ tw.img }>
                      <div className="photo" style={{ backgroundImage: `url(${ tw.img })`}}></div>
                    </a>
                  </td>
                  : ""
                }
              </tr>
            </tbody>
          </table>
          <hr />
        </div>
      );
    }

    return (
      <div className="twitter-page">
        <Grid>
          <Row>
            <Col xs={12}>
              <div className="floating-controls">
                <Button bsStyle="success" onClick={() => this.socket.emit('twitter.all') }>Refresh</Button>
                <Button bsStyle="danger" onClick={() => this.socket.emit('twitter.clear') }>Clear Screen</Button>
              </div>
              <div style={this.props.style}>

                { tweets }
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
