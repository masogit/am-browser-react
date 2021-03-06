import React, {Component} from 'react';
import * as ExplorerActions from '../../actions/explorer';
import {toggleSidebar} from '../../actions/system';
import RecordList from './RecordList';
import Box from 'grommet/components/Box';
import AMSideBar from '../commons/AMSideBar';
import ContentPlaceHolder from '../commons/ContentPlaceHolder';
import { CATEGORY_MY_ASSETS } from '../../constants/ServiceConfig';

export default class Explorer extends Component {

  constructor() {
    super();
    this.state = {
      view: null,
      navigation: null
    };
  }

  componentWillMount() {
    const id = this.props.params.id;
    if (id) {
      ExplorerActions.loadView(id).then((view) => {
        this.setState({view: view});
      });
    } else {
      ExplorerActions.loadViews().then(views => {
        if (views) {
          let excludeMyAssets = views.filter((view) => {
            return view.category != CATEGORY_MY_ASSETS;
          });
          const content = excludeMyAssets.map((view, key) => ({
            key: view._id,
            groupby: view.category,
            onClick: this.queryView.bind(this, view),
            search: view.name,
            child: view.name
          }));
          this.setState({navigation: content});
        }
      });
    }
  }

  queryView(view) {
    this.setState({
      view: null
    }, ()=> {
      this.setState({
        view: view
      });
    });
  }

  render() {
    const {navigation, view} = this.state;
    let content = <ContentPlaceHolder content='Select an item to query.'/>;

    const focus = {};
    if (view) {
      focus.expand = view.category;
      focus.selected = view._id;
      content = (
        <Box margin={{horizontal: 'small'}} flex={true}>
          <RecordList body={view.body} title={view.name} root={true} cache={true}/>
        </Box>
      );
    } else {
      focus.expand = false;
      focus.selected = '';
      toggleSidebar(true);
    }


    return (
      <Box direction="row" flex={true}>
        {navigation && <AMSideBar focus={focus} title='Views Navigation' contents={navigation}/>}
        {content}
      </Box>
    );
  }
}
