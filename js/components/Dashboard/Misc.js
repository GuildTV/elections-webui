import React from 'react';
import {
  Button
} from 'react-bootstrap';

export default class Boards extends React.Component {
  runTemplate(e){
    console.log("Running template:", e.target.getAttribute('data-id'));

    // this.context.socket.emit(RunTemplateKey, {
    //   template: e.target.getAttribute('data-id'),
    //   data: e.target.getAttribute('data-data'),
    //   dataId: e.target.getAttribute('data-key')
    // });
  }

  render() {
    return (
      <div>
        <h3>Graph</h3>
        <p>
          <Button data-id="graph" data-key="graph" onClick={(e) => this.runTemplate(e)} className="btn-lg">Fullscreen</Button>
        </p>

      </div>
    );
  }
}
