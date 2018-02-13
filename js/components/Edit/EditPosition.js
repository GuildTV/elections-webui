import React from 'react';
import axios from 'axios';
import Switch from 'react-bootstrap-switch';
import { withRouter } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import {
  Form, FormGroup, FormControl, ControlLabel, 
  Grid, Row, Col, 
  Button
} from 'react-bootstrap';

class EditPositionInner extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: undefined,
      type: 'candidateSabb',
      fullName: '',
      compactName: '',
      miniName: '',
      order: 9,
      winnerOrder:9,
      sidebarUseOfficer: true
    };
  }

  setData(data){
    if(data === null || data === undefined){
      this.setState({
        id: undefined,
        type: 'candidateSabb',
        fullName: '',
        compactName: '',
        miniName: '',
        order: 9,
        winnerOrder: 9,
        sidebarUseOfficer: true
      });
    } else {
      this.setState(data);
    }
  }

  componentDidMount() {
    this.updateData(this.props);
  }
  componentWillReceiveProps(props){
    this.updateData(props);
  }
  componentWillUnmount(){
    this.setData({});
  }
  updateData(props){
    const { id } = props.params;
    if (!id){
      this.setData({});
    } else {
      axios.get('/api/position/'+id)
      .then(res => {
        this.setData(res.data || {});
        console.log("Loaded position");
      })
      .catch(err => {
        this.setData({});
        alert("Get position error:", err);
      });
    }
  }

  handleFullNameChange(e) {
    this.setState({fullName: e.target.value});
  }
  handleCompactNameChange(e) {
    this.setState({compactName: e.target.value});
  }
  handleMiniNameChange(e) {
    this.setState({miniName: e.target.value});
  }
  handleTypeChange(e) {
    this.setState({type: e.target.value});
  }

  handleOrderChange(e) {
    this.setState({ order: parseInt(e.target.value) });
  }
  handleWinnerOrderChange(e) {
    this.setState({ winnerOrder: parseInt(e.target.value) });
  }
  handleShowOfficerSidebarChange(s) {
    this.setState({ sidebarUseOfficer: s.value() });
  }

  handleSubmit(e) {
    console.log(this.state);

    e.preventDefault();

    let {id, fullName, compactName, miniName, type, order, winnerOrder, sidebarUseOfficer} = this.state;

    if (!fullName || !compactName || !miniName || !type || !order || !winnerOrder) {
      //todo error handling
      alert("Missing input data");
      return;
    }

    const data = {
      fullName,
      compactName,
      miniName,
      type,
      order,
      winnerOrder,
      sidebarUseOfficer,
    };

    if (id) {
      axios.post('/api/position/'+id, data)
      .then(res => {
        console.log("Saved position");
        this.setState(res.data);
      })
      .catch(err => {
        alert("Save position error:", err);
      });
    } else {
      axios.put('/api/position', data)
      .then(res => {
        console.log("Created position");
        this.props.router.push("/edit/position/" + res.data.id);
      })
      .catch(err => {
        alert("Create position error:", err);
      });
    }
  }

  handleDelete() {
    const id = this.props.params.id;
    if (!id)
      return;

    if (!confirm("This will delete all people in the position. Are you sure?"))
      return;

    axios.delete('/api/position/'+id)
    .then(() => {
      console.log("Deleted position");
      this.props.router.push("/edit");
    })
    .catch(err => {
      alert("Delete position error:", err);
    });    
  }

  render() {
    return (
      <div className="scroller">
        <Grid>
          <Row>
            <Col xs={12}>
              <div>
                <Form horizontal onSubmit={e => this.handleSubmit(e)}>
                  <fieldset>
                    <legend>Edit position</legend>
                    <p>
                      <LinkContainer to={`/edit/position/${this.state.id}`}>
                        <Button bsStyle="default">Back to position</Button>
                      </LinkContainer>
                    </p>

                    <FormGroup>
                      <Col componentClass={ControlLabel} xs={2}>
                        ID
                      </Col>
                      <Col xs={10}>
                        <FormControl.Static>{ this.state.id }</FormControl.Static>
                      </Col>
                    </FormGroup>

                    <FormGroup>
                      <Col componentClass={ControlLabel} xs={2}>
                        Type
                      </Col>
                      <Col xs={10}>
                        <FormControl componentClass="select" onChange={e => this.handleTypeChange(e)} value={this.state.type}>
                          <option value="candidateSabb">Candidate - Sabb</option>
                          <option value="candidateNonSabb">Candidate - Non Sabb</option>
                          <option value="other">Other</option>  
                        </FormControl>
                      </Col>
                    </FormGroup>

                    <FormGroup>
                      <Col componentClass={ControlLabel} xs={2}>
                        Full Name
                      </Col>
                      <Col xs={10}>
                        <FormControl type="text" onChange={e => this.handleFullNameChange(e)} value={this.state.fullName} />
                      </Col>
                    </FormGroup>
                    <FormGroup>
                      <Col componentClass={ControlLabel} xs={2}>
                        Prefix Name
                      </Col>
                      <Col xs={10}>
                        <FormControl type="text" onChange={e => this.handleCompactNameChange(e)} value={this.state.compactName} />
                      </Col>
                    </FormGroup>
                    <FormGroup>
                      <Col componentClass={ControlLabel} xs={2}>
                        Mini Name
                      </Col>
                      <Col xs={10}>
                        <FormControl type="text" onChange={e => this.handleMiniNameChange(e)} value={this.state.miniName} />
                      </Col>
                    </FormGroup>

                    <FormGroup>
                      <Col componentClass={ControlLabel} xs={2}>
                        Board Order
                      </Col>
                      <Col xs={10}>
                        <FormControl type="number" min="0" onChange={e => this.handleOrderChange(e)} value={this.state.order} />
                      </Col>
                    </FormGroup>
                    <FormGroup>
                      <Col componentClass={ControlLabel} xs={2}>
                        Winner Order
                      </Col>
                      <Col xs={10}>
                        <FormControl type="number" min="0" onChange={e => this.handleWinnerOrderChange(e)} value={this.state.winnerOrder} />
                      </Col>
                    </FormGroup>

                    <FormGroup>
                      <Col componentClass={ControlLabel} xs={2}>
                        Show 'officer' in sidebar
                      </Col>
                      <Col xs={10}>
                        <Switch onChange={e => this.handleShowOfficerSidebarChange(e)} value={this.state.sidebarUseOfficer} />
                      </Col>
                    </FormGroup>

                    <FormGroup>
                      <Col componentClass={ControlLabel} xs={2}></Col>
                      <Col xs={10}>
                        <Button type="submit" bsStyle="primary">Save</Button>&nbsp;
                        { this.state.id 
                          ? <Button bsStyle="danger" onClick={() => this.handleDelete()}>Delete</Button>
                          : ""
                        }
                      </Col>
                    </FormGroup>
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

export const EditPosition = withRouter(EditPositionInner);