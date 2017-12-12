import React from 'react';
import ReactDOM from 'react-dom';
import { Router, hashHistory } from 'react-router';

import '../sass/app.scss';

import TopBar from './components/TopBar';

import routes from './routes';

ReactDOM.render(
  <div>
    <TopBar />
    <div style={{ marginTop: "65px" }}>
      <Router history={hashHistory} routes={routes} />
    </div>
  </div>,
  document.getElementById('root')
);
