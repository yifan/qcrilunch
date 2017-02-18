import React from 'react';
import { Layout } from 'antd';
import DocumentTitle from 'react-document-title';

import Header from './header';
import Footer from './footer';


class Base extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <DocumentTitle title='Home'>
        <div>
          <Header />
          { this.props.children }
          <Footer />
        </div>
      </DocumentTitle>
    );
  }
}

export default Base;
