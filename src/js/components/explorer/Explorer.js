import React, {Component} from 'react';
import * as ExplorerActions from '../../actions/explorer';
import RecordList from './RecordList';
import Box from 'grommet/components/Box';
import SideBar from '../commons/AMSideBar';
import AMSideToolBar from '../commons/AMSideToolBar';
import ChapterNext from 'grommet/components/icons/base/ChapterNext';
import {toggleSidebar, addTool} from '../../actions/system';
import store from '../../store';

export default class Explorer extends Component {

  constructor() {
    super();
    this.state = {
      view: null,
      navigation: null,
      showSidebar: true
    };
  }

  componentWillMount() {
    addTool({id: 'sidebar', icon: <ChapterNext />, onClick: toggleSidebar, disable: false, isActive: () => store.getState().session.showSidebar});
    toggleSidebar(true);

    const id = this.props.params.id;
    if (id) {
      ExplorerActions.loadView(id).then((view) => {
        this.setState({view: view});
      });
    } else {
      ExplorerActions.loadViews().then(views => {
        if (views) {
          const content = views.map((view, key) => ({
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

    return (
      <Box direction="row" flex={true}>
        <AMSideToolBar />
        <SideBar title='Views Navigation' contents={navigation} toggle={false}
                 focus ={{expand: view ? view.category : false, selected: view ? view._id: ""}}/>
        {view ? <RecordList body={view.body} title={view.name} root={true}/> :
          <Box pad={{horizontal: 'medium'}} flex={true} justify='center' align="center">
            <Box size="medium" colorIndex="light-2" pad={{horizontal: 'large', vertical: 'medium'}} align='center'>
              Select an item to query.
            </Box>
          </Box>
        }
      </Box>
    );
  }
}

