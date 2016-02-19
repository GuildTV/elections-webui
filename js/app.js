import createHashHistory from 'history/lib/createHashHistory';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router'

import TopBar from './components/TopBar'

import routes from './routes';

const history = createHashHistory({queryKey: false});

const topMountNode = document.createElement('div');
document.body.appendChild(topMountNode);
const mountNode = document.createElement('div');
document.body.appendChild(mountNode);

ReactDOM.render(
  <TopBar />,
  topMountNode
);

ReactDOM.render(
  <Router history={history} routes={routes} />,
  mountNode
);
