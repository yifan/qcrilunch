import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory, browserHistory } from 'react-router';
import { AppContainer } from 'react-hot-loader';
import routeSource from './routes';
import referenctiallyEqualRootRoute from './referentially-equal-root-route';
const routes = Object.assign(referenctiallyEqualRootRoute, routeSource);


const mountApp = document.getElementById('react-app');

ReactDOM.render(
  <AppContainer>
    <Router history={browserHistory} routes={routes} key={Math.random()} />
  </AppContainer>
  , mountApp
);

if (module.hot) {
  module.hot.accept('./components/homepage', () => {
    const newRouteSource = require('./routes');
    const newRoutes = Object.assign(referenctiallyEqualRootRoute, newRouteSource);

    ReactDOM.render((
      <AppContainer>
        <Router history={browserHistory} routes={newRoutes} key={Math.random()} />
      </AppContainer>
    ), mountApp);
  });
}
