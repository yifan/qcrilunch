import { Layout, Carousel } from 'antd';
import React, { PropTypes } from 'react';

class Content extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Layout.Content>
        <Carousel autoplay>
          <div><h3>1</h3></div>
          <div><h3>2</h3></div>
          <div><h3>3</h3></div>
          <div><h3>4</h3></div>
        </Carousel>
      </Layout.Content>
    );
  }
}

Content.propTypes = {
};

export default Content;
