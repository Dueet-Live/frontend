import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import DuetHome from '../pages/DuetHome';
import DuetPlay from '../pages/DuetPlay';
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
          <DuetHome />
        </Route>
        <Route exact path="/duet/play">
          <DuetPlay />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default AppRouter;
