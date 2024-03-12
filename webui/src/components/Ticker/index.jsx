import React from 'react';
import update from 'immutability-helper';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import axios from 'axios';

import { 
  Grid, Row, Col, 
  Button,
} from 'react-bootstrap';

import { TickerItem } from './item';
import { TickerEdit } from './edit';

export default class TickerPage extends React.Component {
  constructor(props) {
    super(props);
    this.moveCard = this.moveCard.bind(this);

    this.state = {
      hasChanges: false,
      data: [
        // { id: 1,  enabled: true, text: "Some idiot got banned from campaigning for innaccurate campaign slogans" },
        // { enabled: true, text: "We talk to the leading expert in why students just don't give a fuck" },
        // { enabled: false,text: "Coming up: Answers to your biggest Guild Elections questions" },
        // { enabled: true, text: "We find out what we can get away with saying on here" },
      ],
    };
  }

  componentDidMount() {
    axios.get('/api/ticker/full')
    .then(res => {
      this.setState({
        data: res.data.data || [],
      });
    })
    .catch(err => {
      alert("Failed to load data:", err);
    });
  }

  saveData(){
    axios.post('/api/ticker/save', { data: this.state.data })
    .then(res => {
      this.setState({
        hasChanges: false,
        data: res.data.data || [],
      });
    })
    .catch(err => {
      alert("Failed to save: " + err);
    });
  }

  purgeCurrent() {
    if (!window.confirm("Are you sure?"))
      return;

    axios.post('/api/ticker/purge')
    .then(() => {
      console.log("Purged ticker");
    })
    .catch(err => {
      console.error("Failed to purge ticker:", err);
    });
  }

  moveCard(dragIndex, hoverIndex) {
    const dragCard = this.state.data[dragIndex];

    this.setState(update(this.state, {
      hasChanges: { $set: true},
      data: {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragCard],
        ],
      },
    }));
  }

  addItem(){
    console.log("Add item");

    this.Editor.open("").then(res => {
      const newItem = {
        text: res,
        enabled: true,
      };

      this.setState(update(this.state, {
        hasChanges: { $set: true},
        data: {
          $splice: [
              [this.state.data.length, 1, newItem]
          ],
        },
      }));

    }).catch(() => {});
  }

  editItem(i, item){
    console.log("Edit item #" + item.id);

    this.Editor.open(item.text).then(res => {
      const newItem = Object.assign({}, item);
      newItem.text = res;

      this.setState(update(this.state, {
        hasChanges: { $set: true},
        data: {
          $splice: [
              [i, 1, newItem]
          ],
        },
      }));

    }).catch(() => {});
  }

  setEnabled(i, item, newEnabled){
    console.log("Set item #" + item.id + ": " + newEnabled);

    const newItem = Object.assign({}, item);
    newItem.enabled = newEnabled == true;

    this.setState(update(this.state, {
      hasChanges: { $set: true},
      data: {
        $splice: [
            [i, 1, newItem]
        ],
      },
    }));
  }

  render() {
    const items = this.state.data.map((v,i) => {
      return <TickerItem key={i} data={v} index={i} moveCard={this.moveCard} 
        showEdit={() => this.editItem(i, v)} setEnabled={s => this.setEnabled(i, v, s)} />;
    });

    return (
      <DragDropContextProvider backend={HTML5Backend} >
      <div className="ticker-page">
        <TickerEdit ref={e => this.Editor = e} />

        <Grid>
          <Row>
            <Col xs={12}>
              <div className="floating-controls">
                <Button bsStyle="primary" onClick={() => this.addItem() }>Add</Button>
                <Button bsStyle="success" onClick={() => this.saveData() } disabled={!this.state.hasChanges}>Apply</Button>
                <Button bsStyle="danger" onClick={() => this.purgeCurrent() }>Reset screen</Button>
              </div>

              <h2>Ticker Text</h2>

              <div style={this.props.style}>
                <table className="ticker-table">
                  <tbody>
                    { items }
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
      </DragDropContextProvider>
    );
  }
}
