import React from 'react';
import { Route } from 'react-router';

import EditPositions from './components/EditPositions';
import EditPeople from './components/EditPeople';
import Dashboard from './components/Dashboard';

export default (
  <Route>
    <Route path="/positions" component={EditPositions} />
    <Route path="/people" component={EditPeople} />
    <Route path="/" component={Dashboard} />
  </Route>
);
