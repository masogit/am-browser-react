import React, { Component /*, PropTypes*/ } from 'react';
import { connect } from 'react-redux';
import Sidebar from 'grommet/components/Sidebar';
import Header from 'grommet/components/Header';
//import Footer from 'grommet/components/Footer';
//import Title from 'grommet/components/Title';
//import Menu from 'grommet/components/Menu';
//import CloseIcon from 'grommet/components/icons/Clear';
//import Search from 'grommet/components/Search';
//import Gravatar from 'react-gravatar';
//import Article from 'grommet/components/Article';
//import Section from 'grommet/components/Section';
import { Link } from 'react-router';
import Tabs from 'grommet/components/Tabs';
import Tab from 'grommet/components/Tab';
import {loadViews} from '../../actions';

class Views extends Component {

  constructor() {
    super();
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(loadViews());
  }

  componentWillReceiveProps(newProps) {
  }

  renderItems(items) {
    return items.map((item) => {
      return (
        <p key={item.id}><Link to={`/views/${item.$loki}`}>{item.name}</Link></p>
      );
    });
  }

  render() {
    const { items, isFetching } = this.props;
    return (
    <div className="example">
      <Sidebar primary={true} pad="small" size="large">
        <Tabs initialIndex={0} justify="start">
          <Tab title="Views">
            <Header large={true} flush={false}>
              <input className="sidebarsearch" type="text" placeholder="Search views..."/>
            </Header>
            <div>
              { items.length > 0 &&
              <div>{this.renderItems(items)}</div>
              }
              { !isFetching && items.length === 0 &&
              <h2>No data to display!</h2>
              }
              {isFetching &&
              <div>
                <h2>Fetching Items</h2>
              </div>
              }
            </div>
          </Tab>
        </Tabs>
      </Sidebar>
    </div>
    );
  }
}

let mapStateToProps = (state) => {
  return {
    items: state.views.items  // see store-dev.js or store-prod.js
  };
};

export default connect(mapStateToProps)(Views);
