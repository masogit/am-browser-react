import React, { Component /*, PropTypes*/ } from 'react';
//import PureRenderMixin from 'react-addons-pure-render-mixin';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
//import Sidebar from 'grommet/components/Sidebar';
//import Header from 'grommet/components/Header';
import Split from 'grommet/components/Split';
//import Footer from 'grommet/components/Footer';
//import Title from 'grommet/components/Title';
//import Menu from 'grommet/components/Menu';
//import CloseIcon from 'grommet/components/icons/Clear';
//import Search from 'grommet/components/Search';
//import Gravatar from 'react-gravatar';
//import Article from 'grommet/components/Article';
//import Section from 'grommet/components/Section';
//import { Link } from 'react-router';
//import Tabs from 'grommet/components/Tabs';
//import Tab from 'grommet/components/Tab';
//import {loadViews/*, loadTemplateTable, setSelectedView*/} from '../../actions/views';
import ViewDefDetail from './ViewDefDetail';
import ViewDefList from './ViewDefList';
import * as ViewDefActions from '../../actions/views';
//import store from '../../store';

class ViewDefListContainer extends Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  componentDidMount() {
    // Initialize list data, called only once.
    this.props.actions.loadViews(this.props.params.id);
  }

  componentWillReceiveProps(nextProps) {
    let currentId = this.props.params.id;
    let nextId = nextProps.params.id;
    let { views } = nextProps;
    if (views && views.length > 0) {
      if (!currentId && !nextId) { // Click navigation link, no id param.
        this.props.actions.setSelectedView(views[0].$loki, views[0]);
      } else if (nextId && nextId != currentId) { // Click item in the list, with link like '/views/2', '2' is the id param.
        let selectedView = views.filter(view => view.$loki == nextId)[0];
        this.props.actions.setSelectedView(nextId, selectedView);
      }
    }
  }

  componentWillUpdate(nextProps, nextState) {
  }

  render() {
    const { views, isFetchingViewList, selectedView } = this.props;
    let { dispatch } = this.props;
    let boundActionCreators = bindActionCreators(ViewDefActions, dispatch);
    return (
      <Split flex="right">
        <ViewDefList views={views} isFetchingViewList={isFetchingViewList} {...boundActionCreators}/>
        <ViewDefDetail selectedView={selectedView} {...boundActionCreators}/>
      </Split>
    );
  }
}

let mapStateToProps = (state) => {
  return {
    views: state.views.views,  // see store-dev.js or store-prod.js
    selectedView: state.views.selectedView,
    selectedViewId: state.views.selectedViewId,
    templateTable: state.views.templateTable
  };
};

let mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(ViewDefActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ViewDefListContainer);
