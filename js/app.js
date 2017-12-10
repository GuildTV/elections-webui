import React from 'react';
import ReactDOM from 'react-dom';
import { Router, hashHistory } from 'react-router';
import { Socket } from 'react-socket-io';

import '../sass/app.scss';

import TopBar from './components/TopBar';

import routes from './routes';

ReactDOM.render(
  <Socket>
    <div>
      <TopBar />
      <Router history={hashHistory} routes={routes} />
    </div>
  </Socket>,
  document.getElementById('root')
);
