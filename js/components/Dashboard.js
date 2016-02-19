/*
* External Dependancies
*/

import React from 'react';
import $ from 'jquery';
import {
  Grid, Row, Col, 
  Input, Button,
  Popover, OverlayTrigger
} from 'react-bootstrap';
import Socket from 'react-socket';

/*
* Variables
*/
const GetPeopleKey = "getPeople";
const RunTemplateKey = "runTemplate";
const SetWinnerKey = "setWinner";
const ClearWinnerKey = "clearWinner";

/*
* React
*/
export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      people: [],
      filter: ""
    }
  }

  componentDidMount() {
    this.updateData();
  }

  updateData(){
    this.refs.sock.socket.emit(GetPeopleKey);
  }

  filterNames(e){
    var filter = this.refs.filter.getValue();
    this.setState({ filter });
  }

  loadedNames(data){
    var people = JSON.parse(data);

    this.setState({ people });
    console.log(people);
  }

  render() {
    var peopleList = this.state.people
      .filter((p) => Dashboard.filterPerson(this.state.filter, p))
      .map((p) => <PersonEntry key={p.id} refs={this.refs} parent={this} data={p} />);

    $('.popover').remove();


    return (
      <div>
        <Socket.Event name={ GetPeopleKey } callback={ this.loadedNames.bind(this) } ref="sock"/>

        <Grid>
          <Row>
            <Col xs={12}>
              <form className="form-horizontal">
                <Input label="Search:" labelClassName="col-xs-2" wrapperClassName="col-xs-10">
                  <Row>
                    <Col xs={10}>
                      <Input type="text" onChange={this.filterNames.bind(this)} ref="filter"  />
                    </Col>
                    <Col xs={2}>
                      <Button bsStyle="success" onClick={this.updateData.bind(this)}>Refresh Data</Button>
                    </Col>
                  </Row>
                </Input>
              </form>
              <hr />

              { peopleList }
            </Col>
          </Row>
        </Grid>
      </div>    
    );
  }

  static filterPerson(filter, p){
    if(filter == "")
      return true;

    filter = filter.toLowerCase();

    var name = p.firstName + " " + p.lastName;
    if(name.toLowerCase().indexOf(filter) != -1)
      return true;

    return false;
  }
}

const overlayCss = {
  marginTop: "72px",
  textAlign: "center"
}

class PersonEntry extends React.Component {
  runTemplate(e){
    console.log("Running template:", e.target.getAttribute('data-id'));

    this.props.refs.sock.socket.emit(RunTemplateKey, {
      template: e.target.getAttribute('data-id'),
      data: this.props.data
    });
  }

  setWinner(e){
    console.log("Setting winner:", this.props.data.id);

    this.props.refs.sock.socket.emit(SetWinnerKey, this.props.data);

    //TODO - update client
  }

  cleareWinner(e){
    console.log("Clearing winner:", this.props.data.id);

    this.props.refs.sock.socket.emit(ClearWinnerKey, this.props.data);

    //TODO - update client
  }

  render() {
    var overlayContent = (
      <Popover title="More Templates" style={overlayCss}>
        <Button data-id="SidebarPhoto" onClick={this.runTemplate.bind(this)}>Sidebar - Photo</Button>
        <Button data-id="sidebarText" onClick={this.runTemplate.bind(this)}>Sidebar - Text</Button>
        {
          this.props.data.elect ? 
            <Button onClick={this.clearWinner.bind(this)}>Clear Winner</Button> : 
            <Button onClick={this.setWinner.bind(this)}>Mark Winner</Button>
        }
      </Popover>
    );

    return (
      <Col md={4} sm={6} xs={12} style={{ textAlign: "center" }}>
        <p>{ this.props.data.firstName } { this.props.data.lastName }</p>
        <p>
          <Button data-id="lowerThird" onClick={this.runTemplate.bind(this)}>Lower Third</Button>&nbsp;
          <OverlayTrigger container={this.props.parent} trigger="click" placement="right" overlay={ overlayContent }>
            <Button bsStyle="info">More</Button>
          </OverlayTrigger>
        </p>
      </Col>
    );
  }
}