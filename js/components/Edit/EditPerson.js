import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { withRouter } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import { 
  Grid, Row, Col, 
  Form, FormGroup, FormControl, ControlLabel, 
  Button,
} from 'react-bootstrap';

const ronImg = "data:image/png;base64,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";

class EditPersonInner extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      _positions: [],
      id: undefined,
      firstName: '',
      lastName: '',
      uid: '',
      positionId: '',
      photo: '',
      manifestoOne: "",
      manifestoTwo: "",
      manifestoThree: "",
      order: 9,
      winnerOrder: 9,
      elected: false,
    };
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
    const { id, posId } = props.params;
    if (!id){
      this.setData({});
      if (posId)
        this.setState({ positionId: posId });
    } else {
      axios.get('/api/person/'+id)
      .then(res => {
        this.setData(res.data || {});
        console.log("Loaded person");
      })
      .catch(err => {
        this.setData({});
        alert("Get person error:", err);
      });
    }

    axios.get('/api/positions')
    .then(res => {
      this.setState({ _positions: res.data || [] });
      console.log("Loaded positions");
    })
    .catch(err => {
      this.setState({ _positions: [] });
      alert("Get positions error:", err);
    });
  }

  setData(data){
    if(data === null || data === undefined || data === {}){
      this.setState({
        id: undefined,
        firstName: '',
        lastName: '',
        uid: '',
        positionId: '',
        photo: '',
        manifestoOne: "",
        manifestoTwo: "",
        manifestoThree: "",
        order: 9,
        winnerOrder: 9,
        elected: false,
      });
    } else {
      this.setState(data);
    }
  }

  handleFirstNameChange(e) {
    this.setState({firstName: e.target.value});
  }
  handleLastNameChange(e) {
    this.setState({lastName: e.target.value});
  }

  handleUidChange(e) {
    this.setState({uid: e.target.value});
  }

  handlePositionChange(e) {
    this.setState({positionId: e.target.value});
  }
  handleFirstManifestoPointChange(e) {
    this.setState({ manifestoOne: e.target.value });
  }

  handleSecondManifestoPointChange(e) {
    this.setState({ manifestoTwo: e.target.value });
  }

  handleThirdManifestoPointChange(e) {
    this.setState({ manifestoThree: e.target.value });
  }

  handleOrderChange(e) {
    this.setState({ order: parseInt(e.target.value) });
  }

  handlePhotoChange(){
    const files = ReactDOM.findDOMNode(this.fileUpload).files;

    const reader = new FileReader();
    reader.onload = function(dat) {
      this.setState({ photo: dat.target.result });
    }.bind(this);
    reader.readAsDataURL( files[0] );
  }

  handleSubmit(e) {
    e.preventDefault();

    let {firstName, lastName, uid, id, positionId, manifestoOne, manifestoTwo, manifestoThree, photo, order, elected} = this.state;

    if (!uid || !firstName || !lastName || !positionId) {
      //todo error handling
      alert("Missing input data");
      return;
    }

    let data = {
      id,
      firstName,
      lastName,
      uid,
      positionId,
      manifestoOne,
      manifestoTwo,
      manifestoThree,
      photo,
      order,
      elected
    };

    if (id) {
      axios.post('/api/person/'+id, data)
      .then(res => {
        console.log("Saved person");
        this.setState(res.data);
      })
      .catch(err => {
        alert("Save person error:", err);
      });
    } else {
      axios.put('/api/person', data)
      .then(res => {
        console.log("Created person");
        this.props.router.push("/edit/person/" + res.data.id);
      })
      .catch(err => {
        alert("Create person error:", err);
      });
    }
  }

  deletePerson() {
    const id = this.props.params.id;
    if (!id)
      return;

    axios.delete('/api/person/'+id)
    .then(() => {
      console.log("Deleted person");
      this.props.router.push("/edit/position/" + this.state.positionId);
    })
    .catch(err => {
      alert("Delete person error:", err);
    });    
  }

  isCandidate(){
    const filtered = this.state._positions.filter(p => p.id == this.state.positionId);

    if(filtered.length == 0)
      return false;

    const pos = filtered[0];
    return pos.type.indexOf("candidate") == 0;
  }

  render() {
    let candidateData = <p></p>;
    if(this.isCandidate()){
      candidateData = (
        <div>
          <FormGroup>
            <Col componentClass={ControlLabel} xs={2}>
              First Manifesto Point
            </Col>
            <Col xs={10}>
              <FormControl type="text" onChange={e => this.handleFirstManifestoPointChange(e)} 
                placeholder="First manifesto point" value={this.state.manifestoOne} />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} xs={2}>
              Second Manifesto Point
            </Col>
            <Col xs={10}>
              <FormControl type="text" onChange={e => this.handleSecondManifestoPointChange(e)} 
                placeholder="Second manifesto point" value={this.state.manifestoTwo} />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} xs={2}>
              Third Manifesto Point
            </Col>
            <Col xs={10}>
              <FormControl type="text" onChange={e => this.handleThirdManifestoPointChange(e)} 
                placeholder="Third manifesto point" value={this.state.manifestoThree} />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col componentClass={ControlLabel} xs={2}>
              Photo
            </Col>
            <Col xs={10}>
              <FormControl type="file" onChange={e => this.handlePhotoChange(e)} ref={e => this.fileUpload = e} accept="image/png"  />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} xs={2}></Col>
            <Col xs={10}>
              <img src={!this.state.photo || this.state.photo == '' ? ronImg : this.state.photo} width="200px" height="200px" />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col componentClass={ControlLabel} xs={2}>
              Elected
            </Col>
            <Col xs={10}>
              <FormControl.Static>{ this.state.elected ? "yes" : "no" }</FormControl.Static>
            </Col>
          </FormGroup>
        </div>
      );
    }

    const positions = this.state._positions.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>);

    return (
      <div>
        <Grid>
          <Row>
            <Col xs={12}>
              <div>
                <Form horizontal onSubmit={e => this.handleSubmit(e)}>
                  <fieldset>
                    <legend>Edit person</legend>
                    <p>
                      <LinkContainer to={this.state.positionId ? `/edit/position/${this.state.positionId}` : '/edit'}>
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
                        First Name
                      </Col>
                      <Col xs={10}>
                        <FormControl type="text" onChange={e => this.handleFirstNameChange(e)} value={this.state.firstName} />
                      </Col>
                    </FormGroup>
                    <FormGroup>
                      <Col componentClass={ControlLabel} xs={2}>
                        Last Name
                      </Col>
                      <Col xs={10}>
                        <FormControl type="text" onChange={e => this.handleLastNameChange(e)} value={this.state.lastName} />
                      </Col>
                    </FormGroup>
                    <FormGroup>
                      <Col componentClass={ControlLabel} xs={2}>
                        UID
                      </Col>
                      <Col xs={10}>
                        <FormControl type="text" onChange={e => this.handleUidChange(e)} placeholder="Enter a unique identifer - e.g. ado-ben" value={this.state.uid} />
                      </Col>
                    </FormGroup>

                    <FormGroup>
                      <Col componentClass={ControlLabel} xs={2}>
                        Position
                      </Col>
                      <Col xs={10}>
                        <FormControl componentClass="select" onChange={e => this.handlePositionChange(e)} value={this.state.positionId}>
                          { positions }
                        </FormControl>
                      </Col>
                    </FormGroup>

                    { candidateData }

                    <FormGroup>
                      <Col componentClass={ControlLabel} xs={2}>
                        Order
                      </Col>
                      <Col xs={10}>
                        <FormControl type="number" min="0" onChange={e => this.handleOrderChange(e)} value={this.state.order} />
                      </Col>
                    </FormGroup>

                    <FormGroup>
                      <Col componentClass={ControlLabel} xs={2}></Col>
                      <Col xs={10}>
                        <Button type="submit" bsStyle="primary">Save</Button>&nbsp;
                        { this.state.id 
                          ? <Button bsStyle="danger" onClick={() => this.deletePerson()}>Delete</Button>
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

export const EditPerson = withRouter(EditPersonInner);