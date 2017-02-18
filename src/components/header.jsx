import React from 'react';
import cookie from 'react-cookie';
import { IndexLink } from 'react-router';
import { Layout, Row, Col, Icon, Button } from 'antd';

import LogInOut from './loginout';

class Header extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Layout.Header>
        <Row type='flex' justify='space-between'>
          <Col>
            <IndexLink to='/' activeClassName='active' onlyActiveOnIndex={true}> 
              <span style={{fontSize: "24px", color: "#ffffff"}}>中餐 : Chinese Lunch</span>
            </IndexLink>
          </Col>
          <Col>
            <LogInOut/>
          </Col>
        </Row>
      </Layout.Header>
    );
  }
}

export default Header;
