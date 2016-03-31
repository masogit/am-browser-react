import React, { Component /*, PropTypes*/ } from 'react';
//import PureRenderMixin from 'react-addons-pure-render-mixin';
import { connect } from 'react-redux';
import Sidebar from 'grommet/components/Sidebar';
import Header from 'grommet/components/Header';
import Split from 'grommet/components/Split';
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
import {loadViews} from '../../actions/views';
import View from './View';

class Views extends Component {

  constructor() {
    super();
    //this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(loadViews());
  }

  renderItems(views) {
    return views.map((view) => {
      return (
        <p key={view.$loki}><Link to={`/views/${view.$loki}`}>{view.name}</Link></p>
      );
    });
  }

  render() {
    const { views, isFetching } = this.props;
    return (
      <Split flex="right">
        <Sidebar primary={true} pad="small" size="large">
          <Tabs initialIndex={0} justify="start">
            <Tab title="Views">
              <Header large={true} flush={false}>
                <input className="sidebarsearch" type="text" placeholder="Search views..."/>
              </Header>

              <div>
                {views.length > 0 &&
                <div>{this.renderItems(views)}</div>
                }
                {!isFetching && views.length === 0 &&
                <h2>No data to display!</h2>
                }
                {isFetching &&
                <div>
                  <h2>Fetching views</h2>
                </div>
                }
              </div>
            </Tab>
          </Tabs>
        </Sidebar>
        <View view={views.filter(view => view.$loki == this.props.params.id)}/>
      </Split>
    );
  }
}

let mapStateToProps = (state) => {
  return {
    views: state.views.views  // see store-dev.js or store-prod.js
  };
};

export default connect(mapStateToProps)(Views);
