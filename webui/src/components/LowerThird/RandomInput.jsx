import React from "react";
import {
  Modal,
  Col,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  Button,
} from "react-bootstrap";
import Switch from "react-bootstrap-switch";

export default class RandomInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      headline: false,
      f0: "",
      f1: "",
    };
  }

  close(commit) {
    const { f0, f1, headline } = this.state;

    this.setState({
      showModal: false,
      headline: false,
      f0: "",
      f1: "",
    });

    if (commit === true) this.PromiseResolve({ f0, f1, headline });
    else this.PromiseReject();
  }

  open() {
    return new Promise((resolve, reject) => {
      this.PromiseResolve = resolve;
      this.PromiseReject = reject;

      this.setState({
        showModal: true,
        headline: false,
        f0: "",
        f1: "",
      });
    });
  }

  submit(e) {
    e.preventDefault();

    this.close(true);
  }

  render() {
    const { headline, f0, f1, showModal } = this.state;

    const changeF0 = (e) => {
      this.setState({
        f0: e.target.value,
      });
    };
    const changeF1 = (e) => {
      this.setState({
        f1: e.target.value,
      });
    };
    const changeHeadline = (e) => {
      this.setState({
        headline: e.value(),
      });
    };

    return (
      <Modal show={showModal} onHide={() => this.close()}>
        <Modal.Header closeButton>
          <Modal.Title>Custom Lower Third</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form horizontal onSubmit={(e) => this.submit(e)}>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                Headline
              </Col>
              <Col xs={10}>
                <Switch onChange={changeHeadline} value={headline} />
              </Col>
            </FormGroup>
            <FormGroup controlId="formF0">
              <Col componentClass={ControlLabel} sm={2}>
                Line 1:
              </Col>
              <Col sm={10}>
                <FormControl
                  type="text"
                  value={f0}
                  onChange={changeF0}
                  autoFocus={true}
                  placeholder="GUILD ELECTIONS 2025"
                />
              </Col>
            </FormGroup>
            {headline ? (
              ""
            ) : (
              <FormGroup controlId="formF1">
                <Col componentClass={ControlLabel} sm={2}>
                  Line 2:
                </Col>
                <Col sm={10}>
                  <FormControl type="text" value={f1} onChange={changeF1} />
                </Col>
              </FormGroup>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="primary" onClick={() => this.close(true)}>
            OK
          </Button>
          <Button onClick={() => this.close()}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
