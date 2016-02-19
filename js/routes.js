import React from 'react';
import { IndexRoute, Route } from 'react-router';

import EditPeople from './components/EditPeople';
import Dashboard from './components/Dashboard';

export default (
  <Route>
    <Route path="/people" component={EditPeople} />
    <Route path="/" component={Dashboard} />
  </Route>
);
