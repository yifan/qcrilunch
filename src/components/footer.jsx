import { Layout } from 'antd';
import React from 'react';

class Footer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Layout.Footer style={{ textAlign: 'center' }}>
        Arabic Language Technology, QCRI &copy; Created by Yifan 
      </Layout.Footer>
    );
  }
}

export default Footer;
