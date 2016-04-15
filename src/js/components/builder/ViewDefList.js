import React, { Component/*, PropTypes*/ } from 'react';
//import PureRenderMixin from 'react-addons-pure-render-mixin';
//import { connect } from 'react-redux';
import Sidebar from 'grommet/components/Sidebar';
//import Split from 'grommet/components/Split';
//import Footer from 'grommet/components/Footer';
//import Title from 'grommet/components/Title';
//import Menu from 'grommet/components/Menu';
//import CloseIcon from 'grommet/components/icons/Clear';
//import Search from 'grommet/components/Search';
//import Gravatar from 'react-gravatar';
//import Article from 'grommet/components/Article';
//import Section from 'grommet/components/Section';
import Tabs from 'grommet/components/Tabs';
import Tab from 'grommet/components/Tab';
//import {loadViews/*, loadTemplateTable, setSelectedView*/} from '../../actions/views';
//import ViewDefDetail from './ViewDefDetail';
//import store from '../../store';
import Accordion from '../Accordion';

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

  render() {
    const { views, isFetchingViewList } = this.props;
    return (
        <Sidebar primary={true} pad="small" size="large">
          <Tabs initialIndex={0} justify="start">
            <Tab title="Views">
              <Accordion views={views} isFetching={isFetchingViewList}/>
            </Tab>
          </Tabs>
        </Sidebar>
    );
  }
}
