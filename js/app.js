import createHashHistory from 'history/lib/createHashHistory';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router'

import routes from './routes';

const history = createHashHistory({queryKey: false});

const mountNode = document.createElement('div');
document.body.appendChild(mountNode);


ReactDOM.render(
  <Router history={history} routes={routes} />,
  mountNode
);
