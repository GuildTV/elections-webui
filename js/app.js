import createHashHistory from 'history/lib/createHashHistory';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router'

import TopBar from './components/TopBar'
import Footer from './components/Footer'

import routes from './routes';

const history = createHashHistory({queryKey: false});

const mountNode = document.createElement('div');
document.body.appendChild(mountNode);

var bodyStyle = {
  overflowY: "scroll",
  maxHeight: "calc(100vh - 72px - 200px)"
};

ReactDOM.render(
  <div>
    <TopBar />
    <div style={bodyStyle} >
      <Router history={history} routes={routes} />
    </div>
    <Footer />
  </div>,
  mountNode
);
