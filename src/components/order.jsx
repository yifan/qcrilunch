import React, { PropTypes } from 'react';
import reqwest from 'reqwest';
import cookie from 'react-cookie';
import { Form, Card, InputNumber, Select, Button, Input,
         Checkbox, Row, Col, Icon, message, DatePicker } from 'antd';
import '../styles/order.css';
import Receipt from './receipt'

class OptionDishOrder extends React.Component {
  constructor(props) {
    super(props);
    const value = this.props.value || {};
    this.state = {
      number: value.number || 1,
      order: value.order || null,
    };
    this.handleNumberChange = this.handleNumberChange.bind(this);
    this.handleOrderChange = this.handleOrderChange.bind(this);
    this.triggerChange = this.triggerChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const value = nextProps.value;
      this.setState(value);
    }
  }

  handleNumberChange(value) {
    const number = parseInt(value || 1, 10);
    if (isNaN(number)) {
      return;
    }
    if (!('value' in this.props)) {
      this.setState({ number });
    }
    this.triggerChange({ number });
  }
      
  handleOrderChange(value) {
    if (!('value' in this.props)) {
      this.setState({ order:JSON.parse(value) });
    }
    this.triggerChange({ order:JSON.parse(value) });
  }

  triggerChange(changedValue) {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  }

  render() {
    const { size, menu, after } = this.props;
    const state = this.state;
    const menuItems = menu.map((item, index) => 
      <Select.Option value={JSON.stringify(item, Object.keys(item).sort())} key={`op-${index}`}> 
        {item.name} (QAR:{item.price})
      </Select.Option>);
      
    return (
      <Input.Group>
        <Select defaultValue={this.state.order?JSON.stringify(this.state.order, Object.keys(this.state.order).sort()):''}
          size={size} style={{ width: '60%' }}
          placeholder='additional dish'
          onChange={this.handleOrderChange}
        >
          {menuItems}
        </Select>
        <InputNumber size={size} value={state.number}
          min={1} max={99}
          onChange={this.handleNumberChange}
        />
        {after}
      </Input.Group>
    );
  }
}

class OrderForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: false,
      receiptReady: false,
      shared: false,
      keys: [],
      orders: {},
      menu: [],
      uuid: 0,
    };
    this.addOption = this.addOption.bind(this);
    this.onChangeShared = this.onChangeShared.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLunchSubmit = this.handleLunchSubmit.bind(this);
    this.checkOrder = this.checkOrder.bind(this);
    this.remove = this.remove.bind(this);
  }

  remove(k) {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');

    // can use data-binding to set
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
    delete this.state.orders[`order-${k}`];
  }

  addOption() {
    this.state.uuid ++;
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(this.state.uuid);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys: nextKeys,
    });
  }

  handleLunchSubmit(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ready: false});
        reqwest({
          url: '/api/lunch',
          method: 'post',
          type: 'json',
          contentType: 'application/json',
          data: JSON.stringify({when: values.lunch}),
          error: (err) => {
            console.log(err);
            //message.error('failed to submit your order, pelease try agian later!');
            this.setState({ready: true});
          },
          success: (res) => {
            if ('err' in res) {
              console.log('success-err', res);
              //message.error(res.err);
            }
            else {
              this.setState({lunch: res.lunch});
            }
            this.setState({ready: true});
            console.log(this.state);
          }
        });
      }
      else {
        console.log(err);
      }
    });
  }

  handleSubmit(e) {
    console.log(this.state);
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        var orders = [];
        if ('keys' in values.keys) {
          values['keys'].map((k) => {
            const orderKey = `order-${k}`;
            orders.push(values[orderKey]);
          });
        }
        this.setState({ready: false});
        reqwest({
          url: '/api/order',
          method: 'post',
          type: 'json',
          contentType: 'application/json',
          data: JSON.stringify({lunch: this.state.lunch, shared: this.state.shared, orders: orders}),
          error: (err) => {
            message.error('failed to submit your order, pelease try agian later!');
            console.log(err);
            this.setState({ready: true});
          },
          success: (res) => {
            console.log(res);
            if ('err' in res) {
              message.error(res.err);
              console.log(res.err);
              this.state.set({ready:true});
            }
            else {
              this.context.router.push('/receipt');
            }
          }
        });
      } else {
        console.log(err);
      }
    });
  }

  onChangeShared(e) {
    this.setState({
      shared: e.target.checked
    });
  }

  checkOrder(rule, value, callback) {
    if (value.order === null) {
      callback('You must choose a dish!');
      return;
    } else if (value.number <= 0) {
      callback('Potion has to be greater than zero!');
      return;
    }
    callback();
  }

  componentWillMount() {
    // check if menu is empty 
    this.setState({ready: false});
    reqwest({
      url: '/api/menu',
      method: 'get',
      type: 'json',
      success: (res) => {
        this.setState({ menu: res});
      }
    });

    reqwest({
      url: '/api/order',
      method: 'get',
      type: 'json',
      withCredentials: true,
      success: (res) => {
        if ('err' in res) {
          console.log('error when geting order');
          message.error('failed to fetch order from server!');
        } else {
          console.log(res);
          if (!('lunch' in res)) {
            message.error('No lunch date found, you need to set up a lunch!');
            this.setState({lunch: null, ready: true});
          }
          else {
            const orders = {};
            const keys = [];
            res.dishes.map((order,i) => {
              keys.push(i);
              const orderKey = `order-${i}`;
              orders[orderKey] = order;
            });

            const uuid = res.dishes.length;

            this.setState({shared: res.shared, orders: orders, keys: keys, 
              ready: true, uuid: uuid, lunch: res.lunch, when: res.when});
          }
        }
      }
    });
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    getFieldDecorator('keys', { initialValue: this.state.keys });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k, index) => {
      const orderKey = `order-${k}`;
      if (!(orderKey in this.state.orders)) {
        this.state.orders[orderKey] = {
          number: 1,
          order: null,
        };
      }
      const order = this.state.orders[orderKey];
      const deleteButton = (
        <Icon className='dynamic-delete-button'
          type='minus-circle-o'
          onClick={() => this.remove(k)}
        />);
      return (
        <Form.Item
          required={false}
          key={`order-${k}`}
        >
          {getFieldDecorator(`order-${k}`, {
            initialValue: { number: order.number, order: order.order },
            rules: [{ validator: this.checkOrder }],
          })(
            <OptionDishOrder menu={this.state.menu} after={deleteButton}/>
          )}
        </Form.Item>
      );
    });
    if (this.state.ready) {
      if (this.state.lunch === null) {
        return (
          <Row type='flex' justify='center'>
            <Col span={12}>
              <Card title='Would you like to set up a lunch?'>
                <Form onSubmit={this.handleLunchSubmit}>
                  <Form.Item>
                    <Input.Group compact>
                      {getFieldDecorator('lunch', {
                        rules: [{type: 'object', required: true, message: 'please choose a date!'}],
                      })(
                        <DatePicker />
                      )}
                      <p className="ant-form-text"> noon </p>
                    </Input.Group>
                  </Form.Item>
                  <Form.Item>
                    <Button type='primary' htmlType='submit' size='large'>Create Lunch</Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        );
      } else {
        console.log(this.state);
        return (
          <Row>
            <Col sm={0} md={6} lg={6}>
            </Col>
            <Col sm={24} md={12} lg={12}>
            <Card title={`Order for lunch ${this.state.when}:`}>
              <Form onSubmit={this.handleSubmit}>
                <Form.Item 
                >
                  <Input.Group compact>
                    {getFieldDecorator('shared-dish', {
                      initialValue: this.state.shared
                    })(
                      <Checkbox onChange={this.onChangeShared} checked={this.state.shared} /> 
                    )}
                    <p className='ant-form-text'>I am participating a shared lunch of varity of dishes (QAR35-40).</p> 
                  </Input.Group>
                </Form.Item>
                <Form.Item >
                  <h3> Additional options: </h3>
                </Form.Item>

                {formItems}

                <Form.Item >
                  <Button type='dashed' onClick={this.addOption}>
                    <Icon type='plus' >Add Option Dish</Icon>
                  </Button>
                </Form.Item>
                <Form.Item >
                  <Col span={12}>
                    <Button type='primary' htmlType='submit'> Submit and Estimate Price </Button>
                  </Col>
                  <Col span={12}>
                    <Button type='primary' onClick={()=>this.context.router.push('/receipt')}> Check Receipt </Button>
                  </Col>
                </Form.Item>
              </Form>
            </Card>
            </Col>
          </Row>
        );
      }
    } else {
      return (<p> loading </p>);
    }
  }
}

OrderForm.contextTypes = {
  router: React.PropTypes.object
};

const OrderPage = Form.create()(OrderForm);

export default OrderPage;
