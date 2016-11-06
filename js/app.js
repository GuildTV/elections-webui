import React from 'react';
import ReactDOM from 'react-dom';
import { Router, hashHistory } from 'react-router';

import '../less/app.less';

import TopBar from './components/TopBar';

import routes from './routes';

ReactDOM.render(
  <div>
    <TopBar />
    <Router history={hashHistory} routes={routes} />
  </div>,
  document.getElementById('root')
);
