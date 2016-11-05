import React from 'react';
import ReactDOM from 'react-dom';
import { Router, browserHistory } from 'react-router'

import '../less/app.less';

import TopBar from './components/TopBar'

import routes from './routes';

ReactDOM.render(
  <div>
    <TopBar />
    <Router history={browserHistory} routes={routes} />
  </div>,
  document.getElementById('root')
);
