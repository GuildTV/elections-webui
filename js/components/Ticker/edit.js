import React from 'react';
import {
  Modal,
  Col, 
  Form, FormGroup, FormControl,
  Button,
} from 'react-bootstrap';

export class TickerEdit extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      showModal: false,
      text: "",
    };
  }

  close(commit) {
    const { text } = this.state;

    this.setState({ 
      showModal: false,
      text: "",
    });

    if (commit === true)
      this.PromiseResolve(text);
    else
      this.PromiseReject();
  }

  open(text) {
    if (!text)
      text = "";

    return new Promise((resolve, reject) => {
      this.PromiseResolve = resolve;
      this.PromiseReject = reject;

      this.setState({
        showModal: true,
        text: text,
      });
    });
  }

  render() {
    const { text, showModal } = this.state;

    const change = e => {
      this.setState({
        text: e.target.value
      });
    };

    return (
      <Modal show={showModal} onHide={() => this.close()}>
        <Modal.Header closeButton>
          <Modal.Title>Ticker Item Text</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form horizontal>
            <FormGroup controlId="formHorizontalEmail">
              <Col sm={12}>
                <FormControl type="text" value={text} onChange={change} />
              </Col>
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="primary" onClick={() => this.close(true)}>OK</Button>
          <Button onClick={() => this.close()}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}