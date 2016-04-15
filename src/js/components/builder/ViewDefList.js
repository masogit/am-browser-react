import React, { Component/*, PropTypes*/ } from 'react';
//import PureRenderMixin from 'react-addons-pure-render-mixin';
//import { connect } from 'react-redux';
import Sidebar from 'grommet/components/Sidebar';
import Header from 'grommet/components/Header';
//import Split from 'grommet/components/Split';
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
//import {loadViews/*, loadTemplateTable, setSelectedView*/} from '../../actions/views';
//import ViewDefDetail from './ViewDefDetail';
//import store from '../../store';

export default class ViewsDefList extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
  }

  componentWillUpdate(nextProps, nextState) {
  }

  renderItems(views) {
    return views.map((view) => {
      return (
        <p key={view.$loki}><Link to={`/views/${view.$loki}`}>{view.name}</Link></p>
      );
    });
  }

  render() {
    const { views, isFetchingViewList } = this.props;
    return (
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
                {!isFetchingViewList && views.length === 0 &&
                <h2>No data to display!</h2>
                }
                {isFetchingViewList &&
                <div>
                  <h2>Fetching views</h2>
                </div>
                }
              </div>
            </Tab>
          </Tabs>
        </Sidebar>
    );
  }
}
