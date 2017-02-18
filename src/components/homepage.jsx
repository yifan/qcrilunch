import React from 'react';
import { Layout, Row, Col, Button } from 'antd';
import DocumentTitle from 'react-document-title';
import cookie from 'react-cookie';

import Header from './header';
import Content from './content';
import Footer from './footer';


class HomePage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const user = cookie.load('user');
    if (user) {
      return (
        <Row type='flex' justify='center'> 
          <Col span={4}>
            <Button type='primary' onClick={()=>this.context.router.push('/order')}> Order </Button>
          </Col>
          <Col span={4}>
            <Button type='primary' onClick={()=>this.context.router.push('/receipt')}> Receipt </Button>
          </Col>
        </Row>
      );
    } else {
      return (
        <Content />
      );
    }
  }
}

HomePage.contextTypes = {
  router: React.PropTypes.object
};

export default HomePage;
