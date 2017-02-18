import React, { PropTypes } from 'react';
import reqwest from 'reqwest';
import { message, Modal, Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox, Button } from 'antd';

class SignupForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { passwordDirty: false, ready: false };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePasswordBlur = this.handlePasswordBlur.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.checkPassword = this.checkPassword.bind(this);
    this.checkConfirm = this.checkConfirm.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ready: false});
        reqwest({
          url: '/signup',
          method: 'post',
          data: values,
          error: (err) => {
            console.log(err);
            this.context.router.push('/order');
          },
          success: (result) => {
            if (result == 'OK') {
              message.info('Now please log in!'); 
              this.context.router.push('/');
            }
            else {
              this.setState({ ready: true });
              console.log('failed');
            }
          }
        });
      }
    });
  }

  handlePasswordBlur(e) {
    const value = e.target.value;
    this.setState({ passwordDirty: this.state.passwordDirty || !!value });
  }

  checkPassword(rule, value, callback) {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('Password does not match!');
    } else {
      callback();
    }
  }

  checkConfirm(rule, value, callback) {
    const form = this.props.form;
    if (value && this.state.passwordDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  }

  handleClose() {
    this.context.router.push('/');
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        span: 14,
        offset: 6,
      },
    };
    
    return (
      <Modal visible={true}
        footer={[]}
        onClose={this.handleClose}
        >
        <Form onSubmit={this.handleSubmit}>
          <Form.Item
            {...formItemLayout}
            label='Email'
            hasFeedback
          >
            {getFieldDecorator('email', {
              rules: [{
                type: 'email', message: 'not valid email address',
              }, {
                required: true, message: 'Please type your email here',
              }],
            })(
              <Input/>
            )}
          </Form.Item>
          <Form.Item
            {...formItemLayout}
            label='Password'
            hasFeedback
          >
            {getFieldDecorator('password', {
              rules: [{
                required: true, message: 'Please type your password',
              }, {
                validator: this.checkConfirm,
              }],
            })(
              <Input type='password' onBlur={this.handlePasswordBlur} />
            )}
          </Form.Item>
          <Form.Item
            {...formItemLayout}
            label='Confirm Password'
            hasFeedback
          >
            {getFieldDecorator('confirm', {
              rules: [{
                required: true, message: 'Please confirm your password',
              }, {
                validator: this.checkPassword,
              }],
            })(
              <Input type='password' />
            )}
          </Form.Item>
          <Form.Item
            {...tailFormItemLayout} 
            style={{ marginBottom: 8 }}
          >
            {getFieldDecorator('agreement', {
              valuePropName: 'checked',
            })(
              <Checkbox>I had read the <a>agreement</a></Checkbox>
            )}
          </Form.Item>
          <Form.Item {...tailFormItemLayout}>
              <Button disabled={this.state.ready} size='large' onClick={ () => this.context.router.push('/login') } > Cancel </Button>
              <span> </span>
              <Button disabled={this.state.ready} type='primary' htmlType='submit' size='large'>Register</Button>
          </Form.Item>
        </Form >
      </Modal>
    );
  }
}

SignupForm.contextTypes = {
  router: React.PropTypes.object
};

export default Form.create({})(SignupForm);
