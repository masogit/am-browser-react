import React, { Component/*, PropTypes*/ } from 'react';
//import PureRenderMixin from 'react-addons-pure-render-mixin';
//import { connect } from 'react-redux';
//import Split from 'grommet/components/Split';
//import Footer from 'grommet/components/Footer';
//import Title from 'grommet/components/Title';
//import Menu from 'grommet/components/Menu';
//import CloseIcon from 'grommet/components/icons/Clear';
//import Search from 'grommet/components/Search';
//import Gravatar from 'react-gravatar';
//import Article from 'grommet/components/Article';
//import Section from 'grommet/components/Section';
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
        <Accordion views={views} isFetching={isFetchingViewList} type="views" isEditable={true} newSelectedView={this.props.newSelectedView}/>
    );
  }
}
