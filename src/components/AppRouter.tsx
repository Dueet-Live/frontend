import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Duet from '../pages/Duet';
import Home from '../pages/Home';
import Solo from '../pages/Solo';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route exact path="/solo">
          <Solo />
        </Route>
        <Route exact path="/duet">
          <Duet />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default AppRouter;
