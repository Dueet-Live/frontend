import React, { useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import DuetHome from '../pages/DuetHome';
import DuetPlay from '../pages/DuetPlay';
import Home from '../pages/Home';
import Solo from '../pages/Solo';
import GoogleAnalytics from './GoogleAnalytics';
import Tutorial from './Tutorial';

const AppRouter: React.FC = () => {
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <BrowserRouter>
      <GoogleAnalytics />
      <Tutorial showTutorial={showTutorial} setShowTutorial={setShowTutorial} />
      <Switch>
        <Route exact path="/">
          <Home setShowTutorial={setShowTutorial} />
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
