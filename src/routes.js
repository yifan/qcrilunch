import React from 'react'
import { Route, IndexRoute } from 'react-router'
import cookie from 'react-cookie'
import Base from './components/base'
import HomePage from './components/homepage'
import Signup from './components/signup'
import Order from './components/order'
import Receipt from './components/receipt'

const requireLogin = (nextState, replace, callback) => {
  const user = cookie.load('user'); 
  if (!user) {
    replace('/');
  }
  callback();
};

const routes = {
  path: '/',
  component: Base,
  indexRoute: {
    component: HomePage
  },
  childRoutes: [{
    path: '/login',
    component: HomePage
  }, {
    path: '/signup',
    component: Signup
  }, {
    path: '/logout',
    component: HomePage
  }, {
    path: '/order',
    onEnter: requireLogin,
    component: Order
  }, {
    path: '/receipt',
    onEnter: requireLogin,
    component: Receipt
  }]
}

export default routes
