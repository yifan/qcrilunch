import React, { Component } from 'react';
import cookie from 'react-cookie';
import { Form, Icon, Input, Button, message }  from 'antd';
import reqwest from 'reqwest';


class HorizontalLoginForm extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLogoutClick = this.handleLogoutClick.bind(this);
  }

  handleLogoutClick() {
    reqwest({
      url: '/logout',
      method: 'get',
      success: (result) => {
        if (result == 'OK') {
          this.context.router.push('/');
        }
      }
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        reqwest({
          url: '/login',
          method: 'post',
          data: values,
          error: (err) => {
            console.log(err);
          },
          success: (result) => {
            if (result == 'OK') {
              this.context.router.push('/order');
            }
            else {
              this.setState({ confirmLoading: false });
              message.error('Wrong email or password!');
              console.log('failed');
              console.log(result);
            }
          }
        });
      }
    });

  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const user = cookie.load('user');
    if (user == null) {
      return (
        <Form inline onSubmit={this.handleSubmit}>
          <Form.Item>
            {getFieldDecorator('email', {
              rules: [{
                type: 'email', message: 'not valid email address',
              }, {
                required: true, message: 'Please type your email here',
              }],
            })(
              <Input addonBefore={<Icon type="user" />} placeholder="email" />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: 'Please input your Password!' }],
            })(
              <Input addonBefore={<Icon type="lock" />} type="password" placeholder="Password" />
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit"> Log In </Button>
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={ () => this.context.router.push('/signup') } > Sign Up </Button>
          </Form.Item>
        </Form>
      );
    } else {
      return (
        <Button type='primary' onClick={this.handleLogoutClick}> Logout </Button>
      );
    }
  }
}

HorizontalLoginForm.contextTypes = {
  router: React.PropTypes.object
};

export default Form.create({})(HorizontalLoginForm);
