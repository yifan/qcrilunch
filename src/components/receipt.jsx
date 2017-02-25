import React, { PropTypes } from 'react';
import reqwest from 'reqwest';
import { Table, Button, Switch } from 'antd';

class Receipt extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ready: false, vendor: false };
  } 

  componentWillMount() {
    reqwest({
      url: '/api/receipt',
      method: 'get',
      type: 'json',
      success: (res) => {
        console.log(res);
        this.setState(res);
        this.setState({ready: true});
      }
    });
  }

  render() {
    if (this.state.ready) {
      const vendor = {};
      const data = [];
      const columns = [{
          title: 'Dish',
          dataIndex: 'dishname',
        },{
          title: 'Price',
          dataIndex: 'price',
        },{
          title: 'Unit',
          dataIndex: 'unit',
        },{
          title: 'Who',
          dataIndex: 'who',
        }];

      var key = 0;
      var sharedTotal = 0;
      var rice = 0;
      this.state.dishes.map((d, i) => {
        key ++;
        sharedTotal += d.price;
        if (d.price > 0) {
          vendor[d.name] = d.name in vendor ? vendor[d.name]++ : 1;
        }
        data.push({
          key: key,
          dishname: d.name,
          price: d.price,
          unit: 1,
          who: 'shared',
        });
      });

      var sum = 0;
      var sharedAverage = sharedTotal>0?Math.ceil(sharedTotal/this.state.dishes.length):0;
      this.state.orders.map((o) => {
        var userTotal = o.shared?sharedAverage+4:0;
        o.dishes.map((d) => {
          userTotal += d.order.price * d.number;
        });
        sum += userTotal;
      });

      var deliveryCharge = 0;
      if (sum < 500) {
        sum += 40;
        deliveryCharge = Math.ceil(40 / this.state.orders.length);
      }

      this.state.orders.map((o) => {
        var userTotal = o.shared?sharedAverage+4:0;
        const children = [];
        if (o.shared) {
          key++;
          rice += 4;
          children.push({
            key: key,
            dishname: 'shared + rice',
            price: sharedAverage + 4,
            unit: 1,
            who: o.user,
          });
        }
        o.dishes.map((d) => {
          userTotal += d.order.price * d.number;
          key ++;
          vendor[d.order.name] = d.order.name in vendor ? vendor[d.order.name]+d.number : d.number;
          children.push({
            key: key,
            dishname: d.order.name,
            price: d.order.price,
            unit: d.number,
            who: o.user,
          });
        });

        if (deliveryCharge > 0) {
          userTotal += deliveryCharge;
          key ++;
          children.push({
            key: key,
            dishname: 'delivery',
            price: deliveryCharge,
            unit: 1,
            who: o.user,
          });
        }
        
        key++;
        data.push({
          key: key,
          dishname: 'PERSONAL TOTAL',
          price: userTotal,
          unit: 'QAR',
          who: o.user,
          children: children,
        });
      });

      if (deliveryCharge > 0) {
        key++;
        data.push({
          key: key,
          dishname: 'Delivery Charge',
          price: 40,
          unit: 1,
          who: '',
        });
      }

      key ++;
      data.push({
        key: key,
        dishname: 'TOTAL',
        price: sum,
        unit: 'QAR',
        who: '',
      });

      rice = Math.floor(rice/5);

      vendor['米饭'] = rice;

      const footer = () => <div>
            <Button type='primary' onClick={()=>this.context.router.push('/order')}> Back to Order </Button>
            <span />
            <Switch checkedChildren={'Vendor'} unCheckedChildren={'Customer'} onChange={(c)=>this.setState({vendor:c})}/>
          </div>;

      if (this.state.vendor) {
        const vendordata = [];
        for (var name in vendor) {
          key ++;
          vendordata.push({
            key: key,
            dishname: name,
            price: '',
            unit: vendor[name],
            who:'',
          });
        }

        return (<Table columns={columns}
                  dataSource={vendordata}
                  pagination={false}
                  title={() => <h2> Your Receipt: </h2>}
                  footer={footer}/>);
      } else {
        return (<Table columns={columns}
                  dataSource={data}
                  pagination={false}
                  title={() => <h2> Your Receipt: </h2>}
                  footer={footer}/>);
      }
    } else {
      return (<p> Loading </p>);
    }
  }
};

Receipt.contextTypes = {
  router: React.PropTypes.object
};

export default Receipt;
